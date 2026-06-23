# Development Roadmap: Open-Source Family Tree Software

This document breaks the Master Specification into actionable 1-week sprints for a solo developer, structured to build a robust "bottom-up" foundation that prevents technical debt.

## Phase 1: The Foundation (Weeks 1-4)

### Sprint 1A: Environment & Data Modeling

* **Goal:** Initialize the project and establish the full relational schema including `ltree` path structure. No auth yet — schema must be defined before RLS policies can be written.

* **Tasks:**

    * Initialize Next.js (App Router) + Tailwind + TypeScript project; deploy a "Hello World" to Vercel immediately. Pin React Flow version (`@xyflow/react` v12+) in `package.json` on day one.

    * Supabase/Postgres Setup — full schema:
        * `persons`: `id` (uuid), `first_name`, `last_name`, `birth_date`, `birth_location`, `death_date`, `death_location`, `is_living`, `generation_index` (integer — assigned by DAG engine in Sprint 3), `canvas_x` (float — node position for persistence and real-time sync), `canvas_y` (float), `is_deleted`, `deleted_at`, `created_by`, `last_edited_by`, `path` (ltree). Also add: `search_vector` (tsvector, generated column from `first_name || ' ' || last_name`) + a GIN index for Sprint 10 full-text search.
        * `union_nodes`: `id` (uuid), `partner_1_id`, `partner_2_id`, `relationship_type` (married/partners/custom), `canvas_x` (float), `canvas_y` (float), `is_deleted`, `deleted_at`, `created_by`, `last_edited_by`, `path` (ltree)
        * `edges`: `id` (uuid), `union_node_id`, `child_person_id`, `edge_type` (biological/adopted/foster/guardian), `created_by`, `last_edited_by`
        * `trees`: `id` (uuid), `name`, `creator_id` (the user who created the tree — immutable; only they can delete or transfer creator status), `privacy` (public/private), `legend_config` (jsonb), `updated_at`, `created_by`, `last_edited_by`
        * `tree_collaborators`: `id` (uuid), `tree_id`, `user_id`, `role` (owner/editor/view_only — multiple users can hold "owner"), `invite_token` (text — signed token for the invite link), `invited_at`, `accepted_at` — stores all role-based access grants including co-owners
        * `branch_locks`: `id` (uuid), `tree_id`, `path` (ltree — the locked subtree root), `locked_by`, `locked_at`, `created_by`, `last_edited_by`
        * `person_aliases`: `id` (uuid), `canonical_person_id`, `display_path` (ltree), `tree_id`, `created_by`, `last_edited_by` — stores additional visual placements for people who appear in multiple branches. All edits route to the canonical person row.
        * `notifications`: `id` (uuid), `user_id`, `tree_id`, `type` (merge_approval_request / etc.), `payload` (jsonb), `read_at`, `created_at`, `created_by` — in-app notification store for Owner approval requests. Note: `last_edited_by` is intentionally omitted; notifications are append-only and never modified after creation.

    * **[SCHEMA] Define ltree path structure:** Every `persons` and `union_nodes` row gets a `path ltree` column. Paths follow the pattern `<tree_id>.<union_id>.<person_id>` so that subtree queries and RLS policies can use `@>` / `<@` operators. Document the convention in this file before writing any RLS policies.

    * The "Wiki" Foundation: Add `created_by` and `last_edited_by` UUID columns to every table (values populated by trigger in Sprint 1B — columns exist now so schema is stable).

    * **[CI/CD]** Set up GitHub Actions pipeline on every PR: `tsc --noEmit` (type check), ESLint, Vitest unit tests, `npm audit --audit-level=high`. Configure Vercel for automatic preview deployments (against staging Supabase project) on every PR and automatic production deploys on merge to main. Enable Dependabot on the repository. This pipeline must be green before Sprint 2 begins.

    * **[ENVIRONMENTS]** Configure three environments: dev (`.env.local`), staging (Vercel + separate Supabase project), prod. Document all required environment variables from Master Spec §8 in a `.env.example` file committed to the repo (values redacted). **Region:** set the Vercel deployment region to match the Supabase project region — a mismatch adds cross-region latency to every DB call. **Connection Pooling:** all server-side Supabase client instances must use the connection pooler URL (Transaction mode), not the direct DB URL — Vercel serverless functions otherwise exhaust the Postgres connection limit under real concurrency.

    * **[OBSERVABILITY]** Install and configure Sentry from day one — both client-side (React error boundary) and server-side (Route Handler wrapper). Errors in prod are invisible without this.

    * **[MIGRATIONS]** Initialize Supabase migration system (`supabase init`, `supabase db diff`). All schema changes must go through migration files committed to git — no manual dashboard edits. First migration: the full Sprint 1A schema.

    * **[SEED]** Create a `seed.sql` file in the repo with a small demo tree (8-10 people, 2-3 generations, one union node, one adoption). This seed populates the local dev DB and is the data used for the public landing page demo tree. Keep it maintained as the schema evolves.

    * **[SETUP] Install shadcn/ui + Sonner:** Install and configure shadcn/ui (the component library used across all sprints) and Sonner (toast notifications) in Sprint 1A. The optimistic update pattern (Sprint 2 onward) depends on Sonner for error toasts — installing now prevents a missing-dependency error. Sprint 5's Help overlay and Sprint 6's side panel also use shadcn/ui components.

### Sprint 1B: Auth, RLS & Audit Triggers

* **Goal:** Lock down the database before any data write path is built. No Sprint 2 work begins until this sprint is complete and verified.

* **Tasks:**

    * **[SECURITY] Supabase Auth:** Wire up Google OAuth and email magic link via Supabase Auth. Confirm `auth.uid()` returns the correct user ID in a Postgres query before proceeding.

    * **[SECURITY] Enable RLS:** Enable Row Level Security on every table. Add baseline policies: authenticated users may only `SELECT` records they own; `INSERT`/`UPDATE`/`DELETE` requires ownership. Verify with a test: unauthenticated requests via the anon key must return zero rows. **Creator clause:** the `trees` table policy must include `trees.creator_id = auth.uid()` as an equivalent to the "owner" role — the Creator must retain full access even if their `tree_collaborators` row is ever deleted. This prevents an accidental lockout scenario.

    * **[SECURITY] Audit Field Triggers:** Create the `set_audit_fields` Postgres trigger that populates `created_by` and `last_edited_by` from `auth.uid()` on every `INSERT`/`UPDATE`. Never accept these values from the client.

    * **[TEST]** Write at least three explicit security tests: (1) unauthenticated read returns empty, (2) authenticated user cannot read another user's tree, (3) `created_by` cannot be overridden by a client-supplied value.

### Sprint 2: The Infinite Canvas & Viewport Persistence

* **Goal:** Set up a performant canvas that remembers where the user left off.

* **Tasks:**

    * **Dashboard Route (`/dashboard`):** Build the multi-tree home page users land on after sign-in. Displays all their trees as cards (name, last-edited date, collaborator count) with a "Create new tree" button. Clicking a card routes to `/canvas/[tree_id]`. Required before the canvas is usable — users need a way to create and select trees.

    * Install `@xyflow/react` (React Flow v12+). Define global canvas state with Zustand. Establish the optimistic update pattern from day one: every mutation updates Zustand state immediately, then syncs to DB async, with rollback + Sonner error toast on failure. (shadcn/ui and Sonner are already installed from Sprint 1A.)

    * CustomNode Component: Implement Circle/Square toggle and name hierarchy.

    * Viewport Persistence: Save viewport zoom, x, and y to DB on a debounced 2-second interval. Load from DB on first mount. `canvas_x`/`canvas_y` on individual nodes (defined in Sprint 1A schema) are saved the same way.

    * **Zoom to Fit:** Implement `F` key shortcut and a toolbar button using React Flow's built-in `fitView()`. Essential for navigating large trees.

    * **Canvas Loading State:** While the initial tree data loads from Supabase, show a skeleton canvas with placeholder nodes rather than a blank screen or spinner. Perceived performance matters for large trees.

    * ~~Image Pipeline~~ — deferred to Sprint 6. Cloudinary integration belongs alongside the Command Center side panel where the upload UI lives, not before the DAG engine exists.

### Sprint 3: The Union Node Engine (The DAG Logic)

* **Goal:** Code the core mathematical "Engine" and coordinate math.

* **Tasks:**

    * Midpoint Calculation: Utility to position Union Nodes between parents.

    * Custom Edge Logic: Bezier routing (Solid vs. Dashed lines).

    * Generational Row Locking: Assign `generation_index` based on the "Lowest Parent" rule and write it to the `persons` table.

    * **[TEST]** Write Vitest tests for all coordinate math and generational placement logic — midpoint calculation, "Lowest Parent" rule, edge routing. These are the most likely source of silent regressions as the engine grows.

### Sprint 4: Elastic Layout & Collision Detection

* **Goal:** Prevent node overlap and handle tree expansion.

* **Tasks:**

    * The "Elastic" Shift: Implement the logic where adding/moving a node pushes adjacent subtrees.

    * Collision Listener: Use React Flow's node intersection helpers to ensure zero overlap.

    * Refactor/Buffer: Fix any math bugs from Sprint 3 before moving to UI.

    * **Undo/Redo Stack:** Implement a session-local Ctrl+Z / Ctrl+Shift+Z history stack (cap: 50 steps) covering node moves, field edits, re-routing, and style changes. Use Zustand's state snapshot pattern — each mutating action pushes a state diff onto the stack. Does not persist to DB; the Trash Can handles deletion recovery separately.

## Phase 2: Interaction & Customization (Weeks 5-7)

### Sprint 5: Growth UI & The "Jump" Animation

* **Goal:** Enable omnidirectional building with fluid transitions.

* **Tasks:**

    * Hover Buttons: Cardinal "+" triggers.

    * Global Add Mode: Crosshair cursor and "Ghost Node" placement.

    * The "Jump" Logic: Animate node relocation using Framer Motion when parents are assigned to a floating node.

    * **Keyboard Shortcuts (v1):** Implement the core shortcut layer defined in Master Spec Section 3D. Shortcuts must work when the canvas has focus. Include a Help overlay (press `?`) listing all active shortcuts.

### Sprint 6: The Command Center (Side Panel)

* **Goal:** Build the primary data-entry and re-routing interface.

* **Tasks:**

    * shadcn/ui and Sonner are already installed (Sprint 1A) — use shadcn/ui primitives for all panel UI built in this sprint.

    * Responsive Panel: Sidebar (Desktop) and Bottom Sheet (Mobile) toggle.

    * **Autosave Behavior:** Side panel fields autosave on a ~1 second debounce after the user stops typing — no Save button. Debounce is applied per-field to prevent race conditions. The undo/redo stack captures the settled state after each debounce, not individual keystrokes.

    * Parent Swap Tool: Logic to swap Parent 1/2 and auto-calculate Family Name.

    * Subtree Re-routing: "Move" command to detach and re-attach branches.

    * **Duplicate Detection Warning:** Before saving a new person, query `persons` for matching name + birth year (±5 years). If a match exists, show a non-blocking shadcn/ui Alert: "A person named [Name] born around [year] already exists — is this the same person?" User can dismiss and proceed or open the Fusion Protocol.

    * **Image Pipeline:** Integrate Cloudinary upload widget into the Basic Info tab of the side panel. **[SECURITY]** Signed upload presets only — disable unsigned presets. Server-side MIME type validation (`image/jpeg`, `image/png`, `image/webp`). Enforce a **5MB file size cap** server-side before initiating the Cloudinary upload. Replace uploaded filenames with system-generated UUIDs before storage.

    * **[A11Y] Accessibility Groundwork:** All side panel form fields must have `<label>` elements. All icon buttons must have `aria-label`. Focus must be trapped inside the panel when open and restored to the triggering node on close. This is easier to build correctly now than to retrofit later.

### Sprint 7: Customization & Legend Editor

* **Goal:** High-level aesthetic controls and legend persistence.

* **Tasks:**

    * Dual Settings UI: High-Level (Global) vs. Canvas-Level (Node-specific).

    * Lasso Tool: Multi-node selection via mouse drag.

    * Legend Persistence: Allow users to rename relationship types and save those labels to the Trees table.

    * Style Inheritance: Logic for children to inherit parent branch colors.

## Phase 3: Advanced Logic & Safety (Weeks 8-10)

### Sprint 8: Deletion, Recovery & Trash Can

* **Goal:** Implement a non-destructive deletion workflow.

* **Tasks:**

    * Floating State UI: ⚠️ alarm badge for orphaned nodes.

    * Soft Delete: Set `is_deleted = true` and `deleted_at = NOW()` on deletion. Never hard-delete. The `deleted_at` timestamp (defined in Sprint 1A schema) drives the 30-day expiry window.

    * The Trash Can: UI to view and restore deleted nodes within 30 days. A scheduled Postgres function permanently purges records where `deleted_at < NOW() - INTERVAL '30 days'` — this also satisfies GDPR data retention requirements.

### Sprint 9: Fusion & Validation

* **Goal:** Tree merging and biological constraints.

* **Tasks:**

    * Fusion Protocol: Detect overlap and trigger "Compare & Merge" modal.

    * Discrepancy Resolver: UI to pick which data to keep during a merge.

    * Date Blocker: Prevent "Impossible Dates" (Child older than Parent).

    * **[SECURITY] Merge Authorization Matrix:** Before building the fusion UI, enforce server-side role checks: Owners may merge any branches; Editors may only merge branches they have edit access to; View Only users cannot merge. Merging into a Locked branch always triggers an Owner approval request regardless of role.

    * **[TEST]** Write explicit tests for the authorization matrix: (1) Editor cannot merge a branch they don't own, (2) View Only user receives 403 on merge attempt via direct API call, (3) merging into a Locked branch always triggers approval regardless of role.

### Sprint 10: Performance & Search

* **Goal:** Optimize for 5,000+ nodes.

* **Tasks:**

    * LOD Rendering: Swap SVGs for blocks at low zoom.

    * Advanced Search: Filter by Location, Date Range, and Name with "Search and Pan" center-focus.

    * Mini-Map: Add the corner overview.

    * **[TEST] Performance Benchmarks:** Measure against the targets in Master Spec Section 6B using Playwright performance traces. Must pass before Sprint 11: (1) 1,000-node tree at 60fps on mid-range laptop, (2) 5,000-node tree at 30fps minimum, (3) initial canvas load under 2 seconds for 500-node trees. Fix regressions before proceeding.

## Phase 4: Collaboration & Launch (Weeks 11-14)

### Sprint 11: Subtree Permissions

* **Goal:** Implement granular branch-level access using the auth and RLS foundation from Sprint 1. Authentication is already complete via Supabase Auth — this sprint is about permissions only.

* **Tasks:**

    * Recursive Permissions: Logic to grant access to a branch and its future children using the `ltree` path column established in Sprint 1.

    * **[SECURITY] RLS-Based Subtree Permissions:** Implement subtree access grants as Postgres RLS policies using the `ltree` path column — not as application-layer filters. Write explicit tests for permission edge cases: a collaborator cannot read a locked branch, a View Only user cannot write via direct API call, a rogue client cannot bypass branch locking by calling the API directly.

    * Owner Approval Flow: When a merge into a Locked branch is requested, notify **all Owners** of the tree — email via Resend + write a row to the `notifications` table. Any one Owner can approve or reject. The merge does not proceed until approved.

    * **Collaborator Invitation Flow:** Build the invite UI in High-Level Settings (enter email → assign role: owner/editor/view_only → send). Server-side: create a `tree_collaborators` row with `accepted_at = null` and a signed `invite_token`. Send invitation email via Resend. On invite link click, token is validated, `accepted_at` is set, and permissions activate. Invitations expire after 7 days. Rate-limit sends per tree per hour server-side.

    * **Account Settings Page:** Build the account settings UI (accessible from top-right user menu): display name, email, connected OAuth accounts, delete account. "Delete Account" triggers right-to-erasure: purge all trees where the user is Creator + all associated persons/edges/union_nodes. Trees where they are a Collaborator: remove their `tree_collaborators` row only.

### Sprint 12: Real-time Collaboration

* **Goal:** Multi-user synchronization.

* **Tasks:**

    * Supabase Realtime: Sync node movements and field edits across all active sessions via Supabase's Postgres Changes subscription.

    * **Conflict Resolution: Last Write Wins.** When two users edit the same field simultaneously, the last save wins. The UI shows a non-blocking toast: "This record was updated by [username] — your view has been refreshed." No edit locking in v1. Edit Lock is deferred post-launch.

### Sprint 13: Buffer, Polish & Quality Gate

* **Goal:** Catch-up, UX refinement, and a mandatory quality gate before launch. No launch without this sprint passing.

* **Tasks:**

    * Fix bugs delayed from previous sprints.

    * Fine-tuning animation easing and transition speeds (Framer Motion spring configs).

    * **[TEST] E2E Test Suite:** Expand Playwright tests to cover the full golden path: sign up → create tree → add person → add partner → add child → invite collaborator → view as View Only → delete node → restore from trash. All tests must pass on staging before Sprint 14 begins.

    * **[A11Y] Accessibility Audit:** Full manual keyboard navigation pass across all screens. Run axe-core report and resolve all critical and serious violations. Target: zero critical violations before launch.

    * **[SECURITY] Pre-launch Security Review:** Verify Sentry is receiving errors from staging. Re-run all RLS policy tests. Confirm `SUPABASE_SERVICE_ROLE_KEY` appears in zero client-accessible files. Confirm CSP headers are active and not blocking any app functionality. Run `npm audit`. Test session expiry flow: expire a JWT manually and confirm the "session expired" modal holds canvas state correctly.

    * **[COMPAT] Browser Compatibility:** Manually verify the full golden path in Chrome, Firefox, and Safari. Canvas interactions (pan, zoom, drag) must work identically across all three. Fix any Safari-specific CSS or event-handling bugs before Sprint 14.

    * **Performance profiling:** Run Playwright performance traces against the benchmarks in Master Spec §6B. Fix any regressions.

### Sprint 14: Export, Docs & Deployment

* **Goal:** Final polish and community handoff.

* **Tasks:**

    * Export Suite: PNG/SVG/PDF generation.

    * **GEDCOM Import:** Server-side Route Handler that parses `.ged` files (GEDCOM 5.5.1). Maps `INDI` records to `persons`, `FAM` records to `union_nodes`. File size cap: 10MB — set `api.bodyParser.sizeLimit = '10mb'` in `next.config.js` (Next.js defaults to 4MB and will silently truncate larger files without this). Malformed records skipped with warnings. Large imports (>500 records) processed asynchronously to avoid Vercel's Route Handler timeout — use a Supabase Edge Function or background queue.

    * **GEDCOM Export:** Export entire tree or selected subtree as `.ged` file. Available from High-Level Settings.

    * **GDPR Compliance:** Implement right-to-erasure (account deletion purges all owned trees and person records). Implement data export (GEDCOM + account metadata download from Settings). Publish privacy policy before launch.

    * Open Source Prep: Finalize the following before launch:
        - `README.md` — overview, screenshots, tech stack, quickstart
        - `CONTRIBUTING.md` — how to run locally, set up env vars, run tests, submit a PR
        - `SECURITY.md` — responsible disclosure process (how to report vulnerabilities privately)
        - `CODE_OF_CONDUCT.md` — Contributor Covenant recommended
        - `.github/ISSUE_TEMPLATE/bug_report.md` and `.github/ISSUE_TEMPLATE/feature_request.md`
        - `.github/PULL_REQUEST_TEMPLATE.md`
        - `LICENSE` — AGPL-3.0 in repo root
        - Bug Report UI within the app itself

    * Production migration and official launch. Verify all env vars are set in Vercel production. Run smoke tests on prod immediately after deploy.