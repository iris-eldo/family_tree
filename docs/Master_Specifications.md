# Master Specification: Open-Source Family Tree Software

## 1. Core Architectural Philosophy: The Relationship-Centric DAG

This software is fundamentally architected as a Relationship-Centric Directed Acyclic Graph (DAG). Unlike traditional family tree software that often forces a hierarchical tree structure centering on a single individual, this system utilizes "Union Nodes" to represent partnerships as first-class entities. This architectural choice acknowledges that biological and social lineage is not tied to a single "primary" parent, but emerges from the union of two individuals.

By decoupling biological data from the visual representation, we allow the software to handle complex, real-world genealogical scenarios with mathematical precision. This includes representing multiple serial marriages, blended families, and non-biological guardianship (such as legal adoption or foster care) without breaking the logical flow of the graph. The system is designed to scale from small nuclear families to massive, interconnected community networks where the same individual may appear in multiple contexts across various subtrees.

## 2. Visual Representation & Layout Logic

### A. The Union Node (The Invisible Anchor)

- **Definition & Geometry:** A Union Node is an invisible, non-interactive logical anchor situated at the precise horizontal midpoint between two partners. While it lacks a visible "box," it serves as the critical junction for all relational math within the graph engine.

- **The Hub-and-Spoke Function:** All children (biological, adopted, or otherwise) connect to this Union Node via a vertical Bezier line. This architectural pattern prevents the "cluttered line" syndrome found in many genealogy tools, where five children's lines might all converge on a single parent's node, creating a visual bottleneck. Instead, the children branch out from the Union Node, creating a balanced and aesthetically pleasing "fountain" effect.

- **Automatic Creation Trigger:** The software is designed for speed. When a user clicks the "+" button on an individual’s node to add a child, the engine performs a "proximity and partnership" check. If no Union Node exists for the intended parents, the system generates one instantly and anchors the new child to it. This ensures that every new entry is immediately and correctly integrated into the dual-parent framework, maintaining the integrity of the graph from the first click.

### B. Spousal & Partner Connectivity: Horizontal Isolation

- **Visual Hierarchy:** Spouses and partners are linked by a dedicated horizontal "Partner Line." To maintain a clean visual hierarchy and prevent "graph spaghetti," these individuals do not inherit the vertical ancestor lines of their partner. This "Horizontal Isolation" ensures that the user can focus on a direct lineage without being overwhelmed by the entire ancestral history of every person who marries into the family.

- **Managing Multi-Relationship Logic:** In instances where an individual has had multiple romantic partners or serial marriages, the software generates a separate, unique Union Node for each relationship. This creates clear, distinct branching paths for children of different unions. This is critical for segregating half-siblings and preventing the visual ambiguity that often plagues complex family records.

- **The Relationship Legend & Customization:**

    - **Married:** Visualized as a Solid, Thick Bezier Line, representing a formal, permanent union.

    - **Partners/Unmarried:** Visualized as a Dashed Bezier Line, intended for domestic partnerships or non-legal unions.

    - **Global Semantic Customization:** To support the diverse needs of different cultures and family structures, the legend is a persistent, floating UI element. Users can globally rename these categories or reassign the line styles—for instance, assigning a "Dotted" line to represent "Godparents" or a "Double-Solid" line to represent "Consanguineous Marriages."

### C. Generational Alignment & The "Elastic" Layout Engine

- **Fixed Generational Rows (Auto-Align):** The engine enforces a strict "Generational Row" rule by default. Every member of a specific generation is locked to the same horizontal Y-axis. This creates a chronological "strata" across the canvas, allowing users to scan left-to-right to see all relatives born within a specific era.

- **The "Lowest Parent" Placement Rule:** In relationships between individuals from different generations (e.g., a Gen 2 grandparent and a Gen 4 individual), the software prevents generational "clashing" by placing children in the row exactly one level below the most recent (lowest) parent. In this scenario, the child would appear in Gen 5, ensuring the tree always flows forward in time.

- **The Elastic Layout Mandate:** The layout is truly "Elastic" and reactive. Any adjustment—whether it’s a user expanding a node's width to fit a long name, increasing the spacing buffer between siblings, or adding a 20-person branch—triggers a global recalculation. The software dynamically pushes all adjacent subtrees outward in real-time, much like a physical object displacing water. This ensures that even in massive trees with thousands of members, nodes and lines never overlap, intersect, or obscure critical information.

### D. Motion, Animation, and Spatial Awareness

- **Fluid Repositioning Logic:** When the layout shifts to accommodate new data, nodes must never "teleport" or snap abruptly. The system utilizes Framer Motion transitions to slide nodes to their new coordinates over 300-500ms. This "physicality" helps the user maintain spatial awareness; you can actually see the tree "breathing" as it grows.

- **The "Jump" Animation & Tracking:** For high-impact actions like "Global Add" or "Subtree Re-routing," the target node performs a dramatic "Zoom and Slide" transition. The camera tracks the node as it detaches from its origin and flies to its new destination, providing a visual breadcrumb trail so the user never loses track of a person in a large dataset.

- **Dampened Canvas Interaction:** Canvas panning uses a smooth-dampened algorithm that simulates inertia, making navigation feel premium and responsive. Selecting a search result triggers a camera pan that decelerates gracefully as it centers on the target person.

## 3. Interaction Design: The Power User Interface

### A. The Dual-Settings Architecture

To balance ease of use with professional-grade design flexibility, the UI is split into two specialized settings environments:

1. **High-Level Settings (The "Grand Strategy" View):**

    - **Project Management:** Tools for renaming the project and executing a total canvas wipe (which resets the state to a single blank node for starting over). **Named Snapshots (v2, post-launch):** The ability to save and restore named canvas snapshots (e.g., "Christmas 2025 backup") is architecturally planned but scoped out of v1. It will be revisited after launch.

    - **Global Layout Toggles:** This houses the primary switch for "Auto-Align" mode. Disabling this unlocks "Art-Board Mode," allowing users to drag nodes anywhere on the infinite canvas. Re-enabling it triggers a stern modal warning: "All manual positioning will be lost; the system will snap all nodes back to their generational rows."

    - **Governance:** Management of tree-wide privacy (Public vs. Private) and the collaborative invitation list.

2. **Canvas-Level Settings (The "Designer" Toolbar):**

    - **The Design Palette:** Real-time sliders for node height/width, border-radius (Circle vs. Square), and thematic color palettes (e.g., "Classic Parchment" vs. "High-Contrast Dark").

    - **Density Sliders:** Fine-tuned controls for the spacing buffer between spouses, the horizontal gap between siblings, and the vertical "generation gap" between rows.

    - **Advanced Selection:** One-click shortcuts for "Select Subtree" (all descendants) and a toggle for the "Lasso Tool" for freehand group selection.

### B. The Command Center Side Panel

- **Information Architecture:** The panel is divided into three functional tabs:

    - **Basic Info:** Name, dates, birth location, death date, death location, and profile image uploads. The panel **autosaves on a ~1 second debounce** after the user stops typing — no explicit Save button. Each settled save fires through the optimistic update pattern (Zustand updates immediately, DB syncs async, rollback + Sonner error toast on failure). The undo/redo stack captures the settled state after each debounce, not individual keystrokes.

    - **Relationships:** A managed list of partners and children with "Click-to-Focus" shortcuts.

    - **History & Meta:** A log of who edited this node and when, along with specific metadata like "Adopted" or "Deceased" toggles.

- **The Parent Swap & Naming Logic:** A specialized tool allows users to swap the "Parent 1" and "Parent 2" slots within a Union Node. This is more than a visual swap; if the child’s family name is still set to the "System Default," the software will automatically update the child’s surname to match the individual moved into the "Parent 1" slot. Slot labels are "Parent 1" and "Parent 2" — never gendered — to support the full range of family structures the software is designed to represent.

- **Subtree Re-routing:** A powerful "Move" tool. Users can search for new parents for an existing node. Upon confirmation, that node—and its entire downward branch of descendants—will "detach" and fly to their new logical home in a different subtree.

### C. Onboarding & Empty State

- **First Login:** New users land on a canvas with a single pre-placed "Start Here" node and a dismissible onboarding tooltip sequence (3 steps max): (1) click the node to open the side panel, (2) use the "+" buttons to add relatives, (3) invite collaborators from Settings. The sequence is skippable and re-accessible from the Help menu.
- **Empty Canvas:** If a user wipes the canvas (total reset), the canvas returns to the single "Start Here" state — not a completely blank screen. A completely blank canvas with no affordance is a dead end for new users.
- **No Account Yet:** The public-facing landing page (pre-login) shows a read-only demo tree. Users must authenticate before creating or editing any tree. After authentication, users land on a `/dashboard` route that lists all their trees as clickable cards (tree name, last-edited date, collaborator count, "Create new tree" button). Clicking a card routes to `/canvas/[tree_id]`.

### D. Keyboard Shortcuts

A power-user keyboard shortcut layer is supported across the canvas. Core bindings (v1):

| Shortcut | Action |
|---|---|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| `Esc` | Close side panel / cancel active mode |
| `Delete` / `Backspace` | Delete selected node (triggers Floating State) |
| `Space` + drag | Pan canvas |
| `Ctrl+F` / `Cmd+F` | Focus search bar |
| `Ctrl+A` / `Cmd+A` | Select all visible nodes |
| `G` | Toggle Global Add Mode |
| `L` | Toggle Lasso Tool |
| `F` | Zoom to Fit (fit all nodes in viewport) |

Shortcuts are documented in a persistent Help menu and configurable in a future sprint.

### E. Accessibility (WCAG 2.1 AA)

The application targets WCAG 2.1 Level AA compliance. Requirements:

- All interactive elements (nodes, buttons, panels) are keyboard-navigable via Tab/Shift+Tab and activatable via Enter/Space.
- Focus is managed explicitly during modal transitions (side panel open/close, merge modal).
- All non-text content (badges, icons) has descriptive `aria-label` attributes.
- Color is never the sole means of conveying information — badges and status indicators include text or icon labels alongside color.
- Minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text, across all themes including "High-Contrast Dark."
- Canvas interactions (pan, zoom) are also accessible via keyboard equivalents.
- Accessibility is validated with automated tooling (axe-core) in CI and with a manual keyboard audit before each major release.

### F. Account Settings & Session Behavior

- **Account Settings Page:** Accessible from the top-right user menu. Contains: display name, email address, connected OAuth accounts, and a "Delete Account" button. Deleting an account triggers right-to-erasure: all trees created by this user and all associated person records are permanently deleted. Trees where this user is a Collaborator (not Creator) remain; their collaborator row is removed.

- **Session Expiry:** Supabase Auth JWTs have a configurable expiry. If a session expires while the user is actively editing the canvas, a modal appears: "Your session has expired. Sign in again to continue — your unsaved changes will be preserved." The current Zustand canvas state is held in memory until sign-in completes, then the pending save is retried automatically.

- **Unsaved Changes Warning:** If a user attempts to navigate away or close the tab with unsaved canvas changes, the browser shows a standard `beforeunload` confirmation prompt: "You have unsaved changes. Are you sure you want to leave?"

### G. Omnidirectional Growth & Interaction

- **Addition Triggers:**

    1. **Contextual Hover Buttons:** When a node is active, faint "+" icons appear on the cardinal directions. Top adds ancestors, bottom adds children, and sides add spouses.

    2. **Global Add Mode:** When active, the cursor becomes a crosshair. Users can "drop" a new person anywhere on the blank canvas. By then selecting parents from a dropdown in the sidebar, the user triggers the "Re-routing" logic, pulling that new node into its correct generational row.

## 4. Customization, Aesthetics & Branding

### A. Node Anatomy & Visual Hierarchy

- **Dynamic Avatars:** Users can toggle between circular, square, or rounded-rectangular frames for profile pictures. Borders can be color-coded to indicate status—for example, a gold border might indicate a "Direct Line Ancestor," while a grey border indicates a "Distant Relative."

- **Typography:**

    - **Full Name:** Rendered in a bold, high-contrast font for immediate legibility at all zoom levels.

    - **Family Name:** Rendered in a 25% smaller font with a duller hex code (e.g., slate grey) to provide visual depth without cluttering the node.

- **Visual Badges:**

    - **Padlock:** Displayed on nodes within a "Locked" branch.

    - **Link Icon:** Denotes a "Virtual Duplicate" (e.g., when a person appears twice due to cousin marriage).

    - **Alarm (⚠️):** A high-visibility warning for "Floating" nodes that have been orphaned and require re-connection.

### B. Style Inheritance & The Lasso Tool

- **The Lasso Tool:** Users can drag a selection box over any group of nodes to apply bulk changes—changing 50 nodes to "Circle" shape or "Blue" color in one motion.

- **Branch-Level Inheritance:** To maintain visual consistency, the system supports style inheritance. If a user sets a "Grandparent" node to a specific color, all subsequent descendants added to that branch will "inherit" that color by default. This creates a natural, color-coded heat map of family branches.

## 5. Data Integrity, Safety & Deletion Logic

### A. The "Floating Node" Deletion Strategy

- **Preventing Cascade Accidental Loss:** To prevent the nightmare scenario of deleting a single ancestor and losing a 500-person branch, the software does not perform cascade deletes. Instead, deleting a parent or a Union Node causes the children to enter a Floating State. They remain on the canvas with an ⚠️ indicator, allowing the user to re-link them to new parents without data loss.

- **The Trash Can:** All deleted items are moved to a "Trash" repository, recoverable for 30 days. A `deleted_at` timestamp (not just an `is_deleted` flag) is stored on every soft-deleted record so the 30-day expiry window can be calculated correctly.

- **Undo/Redo:** A standard Ctrl+Z / Ctrl+Shift+Z stack is supported for canvas actions: node moves, field edits, re-routing, and style changes. Undo history is session-local (not persisted to the DB) and caps at 50 steps. The Trash Can handles permanent deletion recovery; the undo stack handles in-session corrections.

- **Duplicate Integrity:** When deleting a "Virtual Duplicate," the system forces a choice: "Delete only this visual instance, or erase this person's data entirely from the platform?"

- **Duplicate Detection (Pre-entry):** Before saving a new person, the system checks for likely duplicates by querying `persons` for records with the same full name and an overlapping birth year (±5 years). If a likely match is found, a non-blocking warning is shown: "A person named [Name] born around [year] already exists in this tree — is this the same person?" The user can dismiss and proceed or switch to the Fusion Protocol. This prevents accidental duplicate creation before it happens.

- **Virtual Duplicate Architecture (Consanguineous Marriages):** A person appearing in two branches (e.g., a cousin marriage) cannot simply have two `ltree` paths — this breaks the single-path model. The solution: a single canonical `persons` row exists with one authoritative path. A `person_aliases` table stores additional visual placements (`id`, `canonical_person_id`, `display_path`, `tree_id`). The canvas renders both the canonical node and any alias nodes; alias nodes display a "Link" badge and all edits route to the canonical record. This prevents data duplication while allowing the graph to represent the visual reality.

### B. Tree Fusion (The "Wiki" Merge)

- **Compare & Merge Workflow:** Dragging Node A onto Node B initiates a fusion protocol. A side-by-side comparison modal appears, highlighting discrepancies in birth dates or locations. The user must resolve these (e.g., "Keep Birthdate from Node A") before the two subtrees are permanently fused.

- **Permission Guards:** Merging a public branch into a "Locked" private branch triggers an "Approval Request" to the Owner, ensuring that collaborators cannot overwrite curated historical data without oversight.

## 6. Collaboration, Privacy & Platform Scaling

### A. Governance & Permissions

- **Tree Privacy Model:** Trees are either **Private** (default) or **Public**.
  - **Private:** Only the Owner and explicitly invited Collaborators can view or edit the tree. Access is granted via email invitation.
  - **Public:** Anyone with the shareable link can view the tree read-only — no account required. Public trees are not indexed by search engines (a `noindex` header is set). Editing always requires authentication regardless of privacy setting.
  - **Living People Warning:** When a tree is switched to Public, the Owner is shown a warning: "This tree may contain data about living individuals. Review the 'is_living' flags before publishing." Living people's data is never auto-redacted — this is the Owner's responsibility.

- **Role-Based Access:** Trees support three roles — **Owner**, **Editor**, and **View Only**. Multiple users can hold the Owner role so that no single point of approval blocks collaborative trees.
  - **Creator** (special designation): The user who created the tree. Only the Creator can permanently delete the tree or transfer Creator status to another user. The Creator always holds Owner-level access. At the database layer, this is enforced by including a `trees.creator_id = auth.uid()` check directly in the `trees` RLS policies — the Creator does not require an additional row in `tree_collaborators` to hold Owner-level permissions, and cannot be accidentally locked out if their collaborator row is ever removed.
  - **Owner:** Can approve locked-branch merge requests, lock/unlock branches, invite collaborators, change tree privacy, and access all Editor capabilities.
  - **Editor:** Can add, edit, and delete person nodes and initiate fusions on branches they have access to.
  - **View Only:** Read-only access. Cannot edit or initiate any mutations.
  Collaborators are invited via email (sent via Resend) and assigned a role. Invitations expire after 7 days.

- **Subtree Locking:** For large collaborative projects, any Owner can "Lock" specific historical branches. Locked nodes are rendered with 40% opacity, and the side panel disables all editing fields for those individuals, effectively "freezing" that part of the tree.

- **Owner Approval Notifications:** When a locked-branch merge is requested, **all Owners** of that tree receive notification via: (1) an email sent via Resend, and (2) an in-app notification badge shown on their next login. Any one Owner can approve or reject the request. This prevents dependency on a single person for approvals.

- **GDPR / Privacy Compliance:** Family tree data about living people is sensitive personal data under GDPR and equivalent regulations. The platform must provide: (1) **Right to Erasure** — deleting an account permanently removes all trees and person records owned by that user; (2) **Right to Access** — users can export all their data (GEDCOM + account metadata) from the Settings page; (3) **Data Retention** — soft-deleted records are permanently purged after 30 days by a scheduled Postgres function. A privacy policy must be published before the public launch.

### B. Performance for Massive Datasets

- **Level of Detail (LOD) Rendering:** To handle trees with 10,000+ individuals, the software uses dynamic rendering. At 100% zoom, full SVG detail and photos are rendered. At 20% zoom, nodes collapse into simple colored rectangles to maintain a silky-smooth 60fps performance on lower-end hardware. On mobile, the LOD collapse threshold is higher (e.g., 50% zoom) due to lower GPU capability.

- **Performance Benchmarks (Verified in Sprint 10):** The following targets must be measured and met before Sprint 11: (1) render and pan a 1,000-node tree at 60fps on a mid-range laptop; (2) render and pan a 5,000-node tree at 30fps minimum; (3) initial canvas load time under 2 seconds for trees up to 500 nodes. These are verified with automated Playwright performance traces, not subjective observation.

- **Advanced Filtered Search:** The search bar supports regex and metadata filters (e.g., "Find all Smiths born in London between 1850 and 1900"). Results feature mini-thumbnails to help distinguish between relatives with identical names.

### C. Data Portability (GEDCOM)

- **GEDCOM Import:** The software supports importing `.ged` files (GEDCOM 5.5.1 standard). On import, the parser maps GEDCOM `INDI` records to `persons` rows and `FAM` records to `union_nodes`. Conflicts (duplicate individuals) trigger the Fusion Protocol (Section 5B). Import is available from the High-Level Settings menu.
- **GEDCOM Export:** Users can export their entire tree or a selected subtree as a `.ged` file. This is the primary data portability mechanism and ensures users are never locked into the platform.
- **Scope:** GEDCOM 5.5.1 only in v1. GEDCOM 7.0 support is deferred post-launch.

## 7. Mobile Strategy

The infinite canvas is a desktop-first experience. Mobile support is scoped as follows:

- **Read-only viewing** on mobile is supported from launch: users can pan (touch-drag), pinch-to-zoom, and tap nodes to open the side panel as a bottom sheet.
- **Editing** (adding nodes, re-routing subtrees, drag interactions) is **desktop-only** in v1. The canvas interaction model requires precision pointer input that touch cannot reliably replicate.
- The Command Center side panel renders as a **bottom sheet on mobile** and a **sidebar on desktop**, toggled via a responsive breakpoint.
- LOD rendering (Section 6B) is especially important on mobile — low-powered devices must collapse nodes to rectangles at lower zoom thresholds than desktop.
- Mobile-specific editing features (if any) are deferred to a post-launch sprint and will be scoped separately.

## 8. Technical Stack Summary

- **Framework:** Next.js (App Router) with TypeScript. Minimum Node.js version: 20 LTS. One repository, one Vercel deployment. API routes are Next.js Route Handlers — no separate Express server. TypeScript is required, not optional — Supabase generates typed schema clients, React Flow and Zustand have full TS support.

- **Frontend:** React (via Next.js), Zustand for high-performance canvas state management, React Flow v12+ (`@xyflow/react`) as the core graph engine. **Note:** React Flow v12 (`@xyflow/react`) has a different API from v10/v11 (`reactflow`) — pin the version in `package.json` on day one.

- **UI Components:** shadcn/ui (built on Radix UI + Tailwind). All interactive UI — modals, side panels, dropdowns, forms — uses shadcn/ui primitives. Components are owned by the project (copy-paste, not a runtime dependency) and fully accessible by default.

- **Notifications/Toasts:** Sonner for all non-blocking toast messages (conflict notifications, save confirmations, error alerts). Integrated via shadcn/ui's Sonner wrapper.

- **Animation:** Framer Motion for all coordinate-based transitions and canvas animations. React Spring is not used.

- **Auth:** Supabase Auth (Google OAuth + email magic link). No NextAuth.js — it is incompatible with `auth.uid()` RLS and audit triggers.

- **Database:** PostgreSQL via Supabase, with `ltree` extension for subtree path queries and RLS-based branch permissions. Schema changes are managed via Supabase migrations (`supabase db diff` → migration files committed to git). Migration files are the source of truth for schema — no manual changes in the Supabase dashboard. All server-side DB connections must use Supabase's connection pooler in **Transaction mode** — Vercel serverless functions otherwise open a new Postgres connection per invocation and will exhaust the connection limit under real concurrency. **The production Supabase project must be on the Pro plan or higher** — the Free tier has no automated backups, and family tree data is irreplaceable. **ltree UUID format:** `ltree` label segments do not allow hyphens — UUID values in path columns must be stored with hyphens removed: `replace(id::text, '-', '')`, producing 32-character hex strings (e.g., `a1b2c3d4e5f64a1b8c2d3e4f5a6b7c8d`).

- **Input Validation:** Zod for server-side validation of all API route request bodies. Every Route Handler validates its input with a Zod schema before touching the database. Client-side validation is UX only.

- **Storage:** Cloudinary (signed upload presets only). AWS S3 is not used.

- **Email:** Resend for transactional email (collaborator invites, account notifications). Supabase's built-in mailer is not used for production flows due to rate limits.

- **Error Monitoring:** Sentry for both client-side (React error boundaries) and server-side (Route Handler exceptions) error tracking. Configured from Sprint 1A alongside the first deployment.

- **Environments:** Three environments — **dev** (local, `.env.local`), **staging** (Vercel preview on a fixed `staging` branch, separate Supabase project), **prod** (Vercel production, production Supabase project). No changes go directly to prod without passing staging. The Vercel deployment region must match the Supabase project region — a region mismatch adds cross-region latency to every database call.

- **Environment Variables:** The following variables are required. Variables prefixed `NEXT_PUBLIC_` are safe to expose to the browser. All others are server-only and must never appear in client code.
  - `NEXT_PUBLIC_SUPABASE_URL` — public
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public (safe only because RLS is enabled)
  - `SUPABASE_SERVICE_ROLE_KEY` — **server-only, bypasses RLS — never in client code**
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — public
  - `CLOUDINARY_API_KEY` — server-only
  - `CLOUDINARY_API_SECRET` — server-only
  - `RESEND_API_KEY` — server-only
  - `NEXT_PUBLIC_SENTRY_DSN` — public (Sentry DSN is designed to be publicly exposed; required for both the client-side React error boundary and the server-side Route Handler wrapper)

- **CI/CD:** GitHub Actions on every pull request: type check (`tsc --noEmit`), lint (ESLint), unit tests (Vitest), E2E smoke tests (Playwright), `npm audit` for dependency vulnerabilities. Vercel preview deployments on every PR against the staging Supabase project. Main branch merges deploy automatically to production.

- **Dependency Security:** Dependabot enabled on the GitHub repository to automatically open PRs for dependency updates. `npm audit --audit-level=high` runs in CI and blocks merges on high/critical vulnerabilities.

- **Testing:** Vitest for unit and integration tests. Playwright for E2E tests. axe-core (via `@axe-core/playwright`) for automated accessibility checks in CI.

- **Security Headers:** Next.js `next.config.js` sets the following headers on all responses: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. CSP must explicitly allowlist Cloudinary's upload widget domain.

- **Optimistic Updates:** All canvas mutations (add node, rename, move, re-route) update Zustand state immediately before the DB write completes. If the DB write fails, the state is rolled back and a Sonner error toast is shown. This keeps the canvas feeling instantaneous.

- **Browser Support:** Modern browsers only — Chrome 120+, Firefox 120+, Safari 17+, Edge 120+. No Internet Explorer. No legacy mobile browsers. This is enforced by the ES2020+ JavaScript output target in `tsconfig.json`.

- **i18n:** English-only in v1. Internationalization is deferred post-launch. All user-facing strings should be kept in a single constants file from day one to make future i18n easier.

- **License:** AGPL-3.0. Anyone who runs this software as a hosted service must open source their modifications.

### Out of Scope for v1

The following features are explicitly out of scope for v1 and will not be built during the 14-sprint roadmap. They are documented here to prevent scope creep and to set expectations for contributors:

| Feature | Status | Notes |
|---|---|---|
| Named canvas snapshots / version history | v2, post-launch | Architecturally planned; revisit after launch |
| Offline mode / PWA | Post-launch | Requires significant service worker investment |
| Internationalization (i18n) | Post-launch | String constants file prepared from day one |
| Edit Lock for real-time conflicts | Post-launch | Last Write Wins in v1 |
| GEDCOM 7.0 support | Post-launch | GEDCOM 5.5.1 only in v1 |
| Mobile editing | Post-launch | Mobile is read-only in v1 |
| Advanced keyboard shortcut customization | Post-launch | Core bindings are fixed in v1 |
| Tree statistics dashboard | Post-launch | Person count, generation count, etc. |

## 9. Security Architecture

Security is enforced at the database layer first and the application layer second. Client-side code is never trusted as a security boundary.

### A. Authentication

- **Supabase Auth is a hard prerequisite** before any data write path is built. No feature that touches the database ships without an authenticated user context. Google OAuth + email magic link is the minimum viable auth implementation and must be wired up in Sprint 1B, after the schema is established in Sprint 1A — not deferred to Sprint 11.
- All API routes validate the session server-side before executing any query.

### B. Row Level Security (RLS)

- **RLS is enabled on every table from day one.** The Supabase anon key is intentionally public, but it is only safe when RLS policies are in place. Without RLS, the anon key grants unrestricted read/write access to the entire database.
- The baseline RLS policy for all tables: authenticated users may only `SELECT` records they are permitted to see; `INSERT`/`UPDATE`/`DELETE` requires ownership or an explicit collaborator grant.
- Subtree permissions (see Section 6A) are implemented as **Postgres RLS policies using the `ltree` path column**, not as application-layer filters. This ensures that no client-side bug or API oversight can expose locked or private branches.

### C. Audit Field Integrity

- The `created_by` and `last_edited_by` columns present on every table are **populated by a Postgres trigger** using `auth.uid()`. These values are never accepted from the client. Any client-supplied value for these fields is ignored.

```sql
CREATE OR REPLACE FUNCTION set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
  END IF;
  NEW.last_edited_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### D. Image Upload Security

- Profile image uploads use **Cloudinary signed upload presets only**. Unsigned presets are disabled.
- Accepted MIME types (`image/jpeg`, `image/png`, `image/webp`) are validated server-side. Frontend file-type checks are UX only and are not relied upon for security. A **5MB file size cap** is enforced server-side before the Cloudinary upload is initiated.
- Uploaded filenames are sanitized and replaced with system-generated UUIDs before storage.

### E. Tree Fusion Authorization

- The merge/fusion workflow (Section 5B) enforces the following authorization matrix before any comparison modal is shown:
  - **Owner:** May merge any branch into any other branch.
  - **Editor:** May initiate a merge only between branches they have edit access to.
  - **View Only / Unauthenticated:** Cannot initiate a merge.
- Merging any branch into a **Locked** branch always triggers an Owner approval request, regardless of the initiating user's role. This check is enforced server-side.

### F. Threat Model Summary

| Surface | Risk | Mitigation |
|---|---|---|
| Supabase anon key exposure | Unrestricted DB access | RLS on all tables from Sprint 1 |
| Client-supplied audit fields | Identity spoofing | DB trigger overwrites with `auth.uid()` |
| Unsigned image uploads | Malicious file storage | Signed presets + server-side MIME validation |
| App-layer permission checks | Bypass via API call | All permissions enforced as RLS policies |
| Fusion without authorization | Collaborator overwrites locked data | Server-side role check before merge executes |
| No auth before data writes | Anonymous data manipulation | Auth required as Sprint 1 prerequisite |
| XSS via user-supplied text | Script injection in node names/fields | All user text rendered via React (auto-escaped); no `dangerouslySetInnerHTML` |
| CSRF on mutating API routes | Forged requests from other origins | Next.js Route Handlers validate `Origin` header; Supabase JWT in `Authorization` header (not cookie) prevents CSRF by default |
| Auth endpoint brute force | Credential stuffing / account enumeration | Supabase Auth built-in rate limiting; enable in Supabase dashboard before launch |
| Collaborator invite abuse | Spam invites to non-existent users; invite flooding | Invite rate-limited per tree per hour; invitations expire after 7 days; only Owners and Editors may send invites |
| GEDCOM import injection | Malformed `.ged` files causing parser crashes or data corruption | GEDCOM files parsed in a sandboxed server-side route; file size capped at 10MB; malformed records are skipped with a warning, not thrown |
| Missing CSP headers | Third-party script injection (Cloudinary widget, Sentry) | CSP header set in `next.config.js`; Cloudinary and Sentry domains explicitly allowlisted |
| `SUPABASE_SERVICE_ROLE_KEY` leakage | Full RLS bypass if key reaches client | Key used only in server-only Route Handlers; never referenced in any file imported by client components |
| Vulnerable dependencies | Supply chain attack via npm package | Dependabot auto-PRs for updates; `npm audit --audit-level=high` blocks CI on critical CVEs |
| Unvalidated API input | Malformed data bypassing business logic and reaching DB | Zod schema validation on every Route Handler before any DB query |
| Authenticated write flooding | High-frequency writes from a valid session abusing the API | Rate limiting per authenticated user on all mutating Route Handlers (Vercel Edge Middleware or Upstash Rate Limiting); implement before production launch |
| Supabase connection exhaustion | Serverless concurrency opening unlimited DB connections | All DB connections routed through Supabase connection pooler in Transaction mode |