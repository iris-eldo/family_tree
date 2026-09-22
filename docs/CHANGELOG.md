# Changelog

All changes to this project are logged here — code, docs, config, schema, and design decisions. Every entry should be small enough to describe in one line.

Format:
`[YYYY-MM-DD] [Sprint X / Pre-Sprint] [Category] — Description`

Categories: `docs` `schema` `auth` `ui` `canvas` `api` `config` `security` `test` `fix`

---

## Pre-Sprint / Project Setup

[2026-06-16] [Pre-Sprint] [schema] — Adopted Relationship-Centric DAG architecture with Union Nodes as first-class entities
[2026-06-16] [Pre-Sprint] [schema] — Chose PostgreSQL + Supabase as the database platform
[2026-06-16] [Pre-Sprint] [auth] — Selected Supabase Auth (Google OAuth) as the sole auth system; NextAuth.js ruled out — incompatible with auth.uid() RLS and audit triggers
[2026-06-16] [Pre-Sprint] [security] — RLS enabled on every table from day one; anon key is intentionally public and safe only because of this
[2026-06-16] [Pre-Sprint] [security] — Audit fields (created_by, last_edited_by) populated by Postgres trigger only; client-supplied values never accepted
[2026-06-16] [Pre-Sprint] [config] — Selected ltree for subtree path querying and RLS-based branch permissions
[2026-06-16] [Pre-Sprint] [config] — Selected React Flow (v12+, @xyflow/react) as core graph engine; Zustand for state; version pinned in package.json on day one
[2026-06-16] [Pre-Sprint] [security] — Cloudinary signed upload presets only; unsigned presets disabled; filenames replaced with UUIDs server-side
[2026-06-16] [Pre-Sprint] [docs] — Sprint 11 scope corrected: auth complete in Sprint 1; Sprint 11 covers ltree RLS subtree permissions and Owner approval flow only
[2026-06-16] [Pre-Sprint] [docs] — Sprint 1 split into 1A (schema + ltree path structure) and 1B (auth + RLS + audit triggers) to manage solo-dev workload
[2026-06-16] [Pre-Sprint] [schema] — ltree path convention defined: <tree_id>.<union_id>.<person_id>; must be established before RLS policies are written
[2026-06-16] [Pre-Sprint] [docs] — Cloudinary image pipeline deferred from Sprint 2 to Sprint 6 (Command Center); no dependency on it before the DAG engine exists
[2026-06-16] [Pre-Sprint] [test] — Explicit security and auth test requirements added to Sprint 1B and Sprint 9
[2026-06-16] [Pre-Sprint] [docs] — Mobile strategy scoped in Master Spec: read-only viewing supported at launch; editing is desktop-only in v1
[2026-06-16] [Pre-Sprint] [config] — Framework decision: Next.js (App Router) + TypeScript; no separate Express server; API via Next.js Route Handlers; replaces "React + Express" in original spec
[2026-06-16] [Pre-Sprint] [config] — Animation library decision: Framer Motion; React Spring ruled out; spec updated in §2D and §8
[2026-06-16] [Pre-Sprint] [config] — Storage decision: Cloudinary only; AWS S3 ruled out
[2026-06-16] [Pre-Sprint] [config] — License decision: AGPL-3.0; hosted forks must open source their changes
[2026-06-16] [Pre-Sprint] [ui] — Terminology decision: Union Node slots renamed "Parent 1" / "Parent 2"; "Mother"/"Father" removed from spec
[2026-06-16] [Pre-Sprint] [docs] — GEDCOM import/export added to v1 scope (Sprint 14); GEDCOM 5.5.1 standard; large imports via async route to avoid Vercel timeout
[2026-06-16] [Pre-Sprint] [ui] — Undo/Redo (Ctrl+Z / Ctrl+Shift+Z) added to v1 scope; session-local stack, 50-step cap, Zustand snapshot pattern (Sprint 4)
[2026-06-16] [Pre-Sprint] [ui] — Keyboard shortcuts added to v1 scope; core bindings table in Master Spec §3D; Help overlay on ? key (Sprint 5)
[2026-06-16] [Pre-Sprint] [ui] — Accessibility (WCAG 2.1 AA) added to v1 scope; axe-core in CI; manual audit in Sprint 13
[2026-06-16] [Pre-Sprint] [schema] — Full schema columns finalized: persons gets death_date, death_location, generation_index, deleted_at; edges gets edge_type; tree_collaborators and branch_locks tables added
[2026-06-16] [Pre-Sprint] [schema] — person_aliases table added for virtual duplicate / consanguineous marriage support; canonical row + display_path approach to avoid ltree path conflicts
[2026-06-16] [Pre-Sprint] [ui] — Onboarding and empty state specified in Master Spec §3C; first login shows "Start Here" node + 3-step tooltip sequence
[2026-06-16] [Pre-Sprint] [security] — Threat model expanded: XSS mitigation, CSRF via JWT-in-header, rate limiting, invite abuse, GEDCOM injection, CSP headers, service role key isolation, Dependabot, Zod validation
[2026-06-16] [Pre-Sprint] [config] — CI/CD pipeline defined: GitHub Actions (type check, lint, Vitest, npm audit), Vercel preview on PR, Dependabot enabled
[2026-06-16] [Pre-Sprint] [config] — Three environments defined: dev / staging (separate Supabase project) / prod; staging is a Vercel fixed-branch preview
[2026-06-16] [Pre-Sprint] [config] — Environment variables documented in Master Spec §8; SUPABASE_SERVICE_ROLE_KEY flagged as server-only, never client-accessible
[2026-06-16] [Pre-Sprint] [config] — Database migration strategy: Supabase migration system (supabase db diff → committed migration files); no manual dashboard edits
[2026-06-16] [Pre-Sprint] [config] — Error monitoring: Sentry configured from Sprint 1A; client-side (error boundary) and server-side (Route Handler wrapper)
[2026-06-16] [Pre-Sprint] [config] — Email service: Resend for collaborator invites and account notifications; Supabase built-in mailer not used for production
[2026-06-16] [Pre-Sprint] [config] — Input validation: Zod on every Route Handler before any DB query; client-side validation is UX only
[2026-06-16] [Pre-Sprint] [security] — CSP headers in next.config.js; Cloudinary and Sentry domains allowlisted; X-Frame-Options: DENY added
[2026-06-16] [Pre-Sprint] [config] — i18n: English-only in v1; all user-facing strings in single constants file for future i18n; multi-language deferred post-launch
[2026-06-16] [Pre-Sprint] [docs] — Public/Private tree model defined: Private = shared-only; Public = anyone with link, read-only, noindex header, living-person warning shown to Owner on publish
[2026-06-16] [Pre-Sprint] [docs] — GDPR compliance scope defined: right to erasure, right to access (data export), 30-day purge schedule, privacy policy required before launch
[2026-06-16] [Pre-Sprint] [docs] — Real-time conflict resolution: Last Write Wins in v1; Edit Lock deferred post-launch
[2026-06-16] [Pre-Sprint] [docs] — Performance benchmarks defined in Master Spec §6B; measured via Playwright traces in Sprint 10
[2026-06-16] [Pre-Sprint] [docs] — Sprint 13 expanded into a mandatory quality gate: E2E golden path, a11y audit, pre-launch security review
[2026-06-16] [Pre-Sprint] [fix] — Section 6A markdown header fixed (was missing ### formatting)
[2026-06-16] [Pre-Sprint] [fix] — Section 2D corrected: "React-Spring" replaced with "Framer Motion" throughout
[2026-06-16] [Pre-Sprint] [docs] — Collaborator invitation flow added to Sprint 11: Resend email, signed token, accepted_at activation, 7-day expiry, rate limiting
[2026-06-16] [Pre-Sprint] [config] — UI component library decision: shadcn/ui (Radix UI + Tailwind); installed in Sprint 6
[2026-06-16] [Pre-Sprint] [config] — Toast/notification library decision: Sonner via shadcn/ui wrapper; used for all non-blocking alerts
[2026-06-16] [Pre-Sprint] [schema] — canvas_x and canvas_y added to persons and union_nodes for node position persistence and real-time sync
[2026-06-16] [Pre-Sprint] [schema] — trees.owner_id renamed to trees.creator_id (immutable); tree_collaborators.role expanded to owner/editor/view_only to support multiple owners
[2026-06-16] [Pre-Sprint] [schema] — notifications table added for in-app Owner approval request alerts
[2026-06-16] [Pre-Sprint] [schema] — invite_token added to tree_collaborators; is_deleted/deleted_at added to union_nodes; created_by/last_edited_by added to person_aliases and branch_locks
[2026-06-16] [Pre-Sprint] [schema] — search_vector (tsvector + GIN index) added to persons for Sprint 10 full-text search; seed.sql added to Sprint 1A for dev/demo data
[2026-06-16] [Pre-Sprint] [schema] — trees.updated_at added; all UUIDs use gen_random_uuid() default
[2026-06-16] [Pre-Sprint] [docs] — Multiple owners decision: any number of users can hold the Owner role; Creator is the immutable original creator with sole delete/transfer rights
[2026-06-16] [Pre-Sprint] [docs] — Owner approval notifications: all Owners notified via Resend email + in-app notification badge; any one Owner can approve
[2026-06-16] [Pre-Sprint] [docs] — Version history removed from v1 scope; replaced with "Named Snapshots (v2, post-launch)" note in Master Spec §3A
[2026-06-16] [Pre-Sprint] [ui] — Zoom to Fit (F key) added to keyboard shortcuts table and Sprint 2 tasks
[2026-06-16] [Pre-Sprint] [ui] — Duplicate person detection added (Sprint 6): pre-entry check for name + birth year match before saving
[2026-06-16] [Pre-Sprint] [ui] — Account settings page added to Sprint 11: display name, email, delete account with right-to-erasure cascade
[2026-06-16] [Pre-Sprint] [ui] — Session expiry handling specified: modal holds canvas state; retries pending save after re-auth
[2026-06-16] [Pre-Sprint] [ui] — Unsaved changes warning specified: beforeunload prompt when navigating away with pending edits
[2026-06-16] [Pre-Sprint] [ui] — Canvas loading skeleton specified in Sprint 2; placeholder nodes while tree data loads
[2026-06-16] [Pre-Sprint] [config] — Optimistic update pattern specified: Zustand updates immediately, DB sync async, rollback + Sonner error on failure
[2026-06-16] [Pre-Sprint] [config] — Browser support policy defined: Chrome/Firefox/Safari/Edge 120+; ES2020+ only; no IE
[2026-06-16] [Pre-Sprint] [config] — Node.js minimum version: 20 LTS
[2026-06-16] [Pre-Sprint] [docs] — Out-of-scope table added to Master Spec §8: 8 features explicitly deferred post-launch
[2026-06-16] [Pre-Sprint] [fix] — Sprint 2 React Flow package corrected: @xyflow/react (v12+), not reactflow
[2026-06-16] [Pre-Sprint] [fix] — Sprint 3/Sprint 4 formatting: missing blank line added
[2026-06-16] [Pre-Sprint] [fix] — Master Spec §9A auth wording corrected: "email magic link" not "Email OAuth"
[2026-06-16] [Pre-Sprint] [test] — Browser compatibility test added to Sprint 13: Chrome, Firefox, Safari manual pass
[2026-06-16] [Pre-Sprint] [fix] — SENTRY_DSN renamed NEXT_PUBLIC_SENTRY_DSN in Master Spec §8; Sentry DSN is designed to be public and is required for the client-side React error boundary to initialize
[2026-06-16] [Pre-Sprint] [fix] — shadcn/ui + Sonner installation moved from Sprint 6 to Sprint 1A; Sprint 2's optimistic update error toast depends on Sonner, which did not exist yet in the original ordering
[2026-06-16] [Pre-Sprint] [fix] — Master Spec §9A corrected: auth wired in Sprint 1B (not "Sprint 1 alongside the schema" — Sprint 1A has no auth)
[2026-06-16] [Pre-Sprint] [fix] — person_aliases schema: alias_id renamed to id for consistency with all other tables; was inconsistent between Master Spec §5A and Sprint 1A schema
[2026-06-16] [Pre-Sprint] [ui] — Autosave behavior defined: side panel autosaves on ~1 second debounce per field; no explicit Save button; undo/redo stack captures settled state, not individual keystrokes
[2026-06-16] [Pre-Sprint] [ui] — Multi-tree /dashboard route added to Master Spec §3C and Sprint 2; users land here after sign-in to create/select trees before entering the canvas
[2026-06-16] [Pre-Sprint] [security] — Creator RLS clarification added: trees.creator_id = auth.uid() is enforced directly in Postgres RLS policies; Creator does not require a tree_collaborators row to retain Owner-level access
[2026-06-16] [Pre-Sprint] [config] — Connection pooling requirement added to Master Spec §8 and Sprint 1A: all server-side DB connections must use Supabase's connection pooler in Transaction mode to prevent Postgres connection exhaustion under Vercel serverless concurrency
[2026-06-16] [Pre-Sprint] [config] — Vercel/Supabase region alignment added to Master Spec §8 and Sprint 1A: deployment regions must match to avoid cross-region DB latency
[2026-06-16] [Pre-Sprint] [security] — 5MB image file size cap added to Master Spec §9D and Sprint 6; enforced server-side before Cloudinary upload is initiated
[2026-06-16] [Pre-Sprint] [config] — Supabase Pro plan requirement noted in Master Spec §8: Free tier has no automated backups; production must be on Pro or higher for irreplaceable family data
[2026-06-16] [Pre-Sprint] [config] — GEDCOM Route Handler body size limit documented in Sprint 14: next.config.js must set api.bodyParser.sizeLimit = '10mb'; default 4MB cap would silently truncate larger GEDCOM files
[2026-06-16] [Pre-Sprint] [docs] — Open source prep in Sprint 14 expanded: added SECURITY.md, CODE_OF_CONDUCT.md, GitHub issue templates, and PR template alongside existing README/CONTRIBUTING/LICENSE
[2026-06-16] [Pre-Sprint] [schema] — notifications table: created_by added for consistency with audit policy; last_edited_by intentionally omitted (notifications are append-only)
[2026-06-16] [Pre-Sprint] [security] — Two new threat model entries added to Master Spec §9F: authenticated write flooding (rate limiting) and Supabase connection exhaustion (connection pooler)
[2026-06-16] [Pre-Sprint] [fix] — Master Spec §3B Basic Info tab updated to include death_date and death_location fields, which were in the schema but absent from the side panel spec
[2026-06-16] [Pre-Sprint] [fix] — Sprint 1B auth task corrected: "Google OAuth and email magic link" (was "Google OAuth" only, inconsistent with Master Spec §8 and §9A)

---

## Sprint 1A — Environment & Data Modeling

[2026-06-23] [Sprint 1A] [config] — Next.js 16.2.9 initialized with App Router, TypeScript, and Tailwind CSS v4
[2026-06-23] [Sprint 1A] [config] — npm packages installed: @xyflow/react@12.11.1, zustand@5.0.14, framer-motion@12.40.0, @supabase/supabase-js@2.108.2, @supabase/ssr@0.12.0, zod@4.4.3, sonner@2.0.7, @sentry/nextjs@10.59.0
[2026-06-23] [Sprint 1A] [config] — shadcn/ui v4.11.0 initialized with Tailwind v4 (auto-detected by shadcn CLI); components written to src/components/ui/
[2026-06-23] [Sprint 1A] [schema] — Full 8-table schema committed as supabase/migrations/20260623000001_initial_schema.sql
[2026-06-23] [Sprint 1A] [schema] — tree_id foreign key added to persons and union_nodes (intentional addition not in original spec); required for RLS policies — without it, policies must parse the ltree path column, which is fragile
[2026-06-23] [Sprint 1A] [schema] — profile_image_url column added to persons (not in original spec); avoids a future ALTER TABLE migration when Cloudinary upload is implemented in Sprint 6
[2026-06-23] [Sprint 1A] [schema] — created_at timestamp added to persons, union_nodes, edges, person_aliases, notifications (standard practice; not listed in spec but universally expected)
[2026-06-23] [Sprint 1A] [schema] — ltree UUID format documented: hyphens must be removed from UUID values when constructing ltree path segments — use replace(id::text, '-', ''); noted in migration header, Master Spec §8, and Sprint_Roadmap.md
[2026-06-23] [Sprint 1A] [config] — @supabase/ssr installed alongside @supabase/supabase-js; @supabase/ssr is required for cookie-based auth token storage in Next.js App Router (localStorage does not work server-side)
[2026-06-23] [Sprint 1A] [config] — Connection pooling clarification: Supabase JS client routes all queries through PostgREST (not a direct Postgres connection), so connection pooling is handled transparently by Supabase infrastructure; no separate pooler URL needed in .env
[2026-06-23] [Sprint 1A] [config] — Sentry initialized: sentry.client.config.ts (browser SDK) + sentry.server.config.ts (Node.js SDK) + src/instrumentation.ts (Next.js server initialization hook)
[2026-06-23] [Sprint 1A] [ui] — src/app/error.tsx added as global React error boundary; captures unhandled errors with Sentry.captureException and shows a "Try again" reset UI
[2026-06-23] [Sprint 1A] [config] — GitHub Actions CI pipeline created: .github/workflows/ci.yml runs tsc, eslint, vitest, npm audit --audit-level=high on push/PR to main and staging
[2026-06-23] [Sprint 1A] [config] — Dependabot configured: .github/dependabot.yml for weekly npm dependency updates
[2026-06-23] [Sprint 1A] [config] — .env.example created with all required environment variables, annotated with which are public vs. server-only
[2026-06-23] [Sprint 1A] [config] — vitest.config.ts and playwright.config.ts configured; jsdom installed for Vitest browser environment; --passWithNoTests prevents CI failure before Sprint 1B tests are written
[2026-06-23] [Sprint 1A] [schema] — seed.sql created: Hartwell family demo tree with 3 generations, 10 persons, 2 union nodes, 1 adoption edge — used for local dev and public landing page demo
[2026-06-23] [Sprint 1A] [config] — supabase/config.toml created manually; developer must run supabase init via Supabase CLI to fully initialize the local dev environment
[2026-06-23] [Sprint 1A] [fix] — next.config.ts: api.bodyParser is a Pages Router option and does not apply to App Router Route Handlers; GEDCOM body size will be enforced in the route handler via content-length header check (Sprint 14)
[2026-06-23] [Sprint 1A] [config] — turbopack.root set in next.config.ts to suppress Next.js workspace root warning caused by a parent-directory package-lock.json
[2026-06-23] [Sprint 1A] [config] — Route stubs created: /dashboard, /canvas/[tree_id], /login (placeholders; full implementations in Sprint 1B and Sprint 2)
[2026-06-23] [Sprint 1A] [config] — Node.js version in CI pinned to 20 (LTS minimum per spec); local dev runs on Node 25.3.0 which exceeds the minimum requirement

