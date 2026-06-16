# Development Roadmap: Open-Source Family Tree Software

This document breaks the Master Specification into actionable 1-week sprints for a solo developer, structured to build a robust "bottom-up" foundation that prevents technical debt.

## Phase 1: The Foundation (Weeks 1-4)

### Sprint 1: Environment & Production-Ready Data Modeling

* **Goal:** Establish a relational schema and a CI/CD pipeline.

* **Tasks:**

    * Initialize React + Tailwind project; deploy a "Hello World" to Vercel immediately.

    * Supabase/Postgres Setup: * Persons table: Basic info, birth_location, is_living.

        * UnionNodes table: The "Anchor" table for partnerships.

        * Edges table: Links Unions to Children.

    * The "Wiki" Foundation: Add created_by and last_edited_by columns to every table.

    * Architectural Guard: Set up ltree or materialized paths for subtree querying.

    * **[SECURITY] Auth First:** Wire up Supabase Auth (Google OAuth) before any data write path is built. Auth is a prerequisite for Sprint 2, not a Sprint 11 concern.

    * **[SECURITY] Enable RLS:** Enable Row Level Security on every table immediately after creation. Add baseline policies: authenticated users can only read/write their own records.

    * **[SECURITY] Audit Field Triggers:** Create a Postgres trigger (`set_audit_fields`) that populates `created_by` and `last_edited_by` from `auth.uid()` on every `INSERT`/`UPDATE`. Never accept these values from the client.

### Sprint 2: The Infinite Canvas & Viewport Persistence

* **Goal:** Set up a performant canvas that remembers where the user left off.

* **Tasks:**

    * Install React Flow. Define global state with Zustand.

    * CustomNode Component: Implement Circle/Square toggle and name hierarchy.

    * Viewport Persistence: Save zoom, x, and y coordinates to the DB/Localstorage.

    * Image Pipeline (Part 1): Integrate Cloudinary/S3 upload widget in a basic "Sandbox" page.

    * **[SECURITY] Signed Uploads Only:** Configure Cloudinary with signed upload presets. Disable unsigned presets. Add server-side MIME type validation (`image/jpeg`, `image/png`, `image/webp` only). Replace uploaded filenames with system-generated UUIDs before storage.

### Sprint 3: The Union Node Engine (The DAG Logic)

* **Goal:** Code the core mathematical "Engine" and coordinate math.

* **Tasks:**

    * Midpoint Calculation: Utility to position Union Nodes between parents.

    * Custom Edge Logic: Bezier routing (Solid vs. Dashed lines).

    * Automated Testing: Write Jest/Vitest tests for the coordinate math to prevent future regressions.

    * Generational Row Locking: Assign generation_index based on the "Lowest Parent" rule.
### Sprint 4: Elastic Layout & Collision Detection

* **Goal:** Prevent node overlap and handle tree expansion.

* **Tasks:**

    * The "Elastic" Shift: Implement the logic where adding/moving a node pushes adjacent subtrees.

    * Collision Listener: Use React Flow's node intersection helpers to ensure zero overlap.

    * Refactor/Buffer: Fix any math bugs from Sprint 3 before moving to UI.

## Phase 2: Interaction & Customization (Weeks 5-7)

### Sprint 5: Growth UI & The "Jump" Animation

* **Goal:** Enable omnidirectional building with fluid transitions.

* **Tasks:**

    * Hover Buttons: Cardinal "+" triggers.

    * Global Add Mode: Crosshair cursor and "Ghost Node" placement.

    * The "Jump" Logic: Animate node relocation using framer-motion when parents are assigned to a floating node.

### Sprint 6: The Command Center (Side Panel)

* **Goal:** Build the primary data-entry and re-routing interface.

* **Tasks:**

    * Responsive Panel: Sidebar (Desktop) and Bottom Sheet (Mobile) toggle.

    * Parent Swap Tool: Logic to swap Parent 1/2 and auto-calculate Family Name.

    * Subtree Re-routing: "Move" command to detach and re-attach branches.

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

    * Soft Delete: is_deleted flag logic.

    * The Trash Can: UI to view and restore deleted nodes within 30 days.

### Sprint 9: Fusion & Validation

* **Goal:** Tree merging and biological constraints.

* **Tasks:**

    * Fusion Protocol: Detect overlap and trigger "Compare & Merge" modal.

    * Discrepancy Resolver: UI to pick which data to keep during a merge.

    * Date Blocker: Prevent "Impossible Dates" (Child older than Parent).

    * **[SECURITY] Merge Authorization Matrix:** Before building the fusion UI, enforce server-side role checks: Owners may merge any branches; Editors may only merge branches they have edit access to; View Only users cannot merge. Merging into a Locked branch always triggers an Owner approval request regardless of role.

### Sprint 10: Performance & Search

* **Goal:** Optimize for 5,000+ nodes.

* **Tasks:**

    * LOD Rendering: Swap SVGs for blocks at low zoom.

    * Advanced Search: Filter by Location, Date Range, and Name with "Search and Pan" center-focus.

    * Mini-Map: Add the corner overview.

## Phase 4: Collaboration & Launch (Weeks 11-14)

### Sprint 11: Auth & Subtree Permissions

* **Goal:** Secure the platform and implement granular access.

* **Tasks:**

    * NextAuth.js: Integration of social/email login.

    * Recursive Permissions: Logic to grant access to a branch and its future children using the path logic from Sprint 1.

    * **[SECURITY] RLS-Based Subtree Permissions:** Implement subtree access grants as Postgres RLS policies using the `ltree` path column — not as application-layer filters. Write explicit tests for permission edge cases: a collaborator cannot read a locked branch, a View Only user cannot write via direct API call, a rogue client cannot bypass branch locking by calling the API directly.

### Sprint 12: Real-time Collaboration

* **Goal:** Multi-user synchronization.

* **Tasks:**

    * Supabase Realtime: Sync movements and edits across all active sessions.

    * Conflict Resolution: Basic "Last Write Wins" or "Edit Lock" notification.

### Sprint 13: Buffer & Polish (The "Safety" Week)

* **Goal:** Catch-up and UX refinement.

* **Tasks:**

    * Fix bugs delayed from previous sprints.

    * Performance profiling.

    * Fine-tuning animation easing and transition speeds.

### Sprint 14: Export, Docs & Deployment

* **Goal:** Final polish and community handoff.

* **Tasks:**

    * Export Suite: PNG/SVG/PDF generation.

    * Open Source Prep: Finalize README.md, CONTRIBUTING.md, and the Bug Report UI.

    * Production migration and official launch.