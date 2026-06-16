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

- **Fluid Repositioning Logic:** When the layout shifts to accommodate new data, nodes must never "teleport" or snap abruptly. The system utilizes React-Spring transitions to slide nodes to their new coordinates over 300-500ms. This "physicality" helps the user maintain spatial awareness; you can actually see the tree "breathing" as it grows.

- **The "Jump" Animation & Tracking:** For high-impact actions like "Global Add" or "Subtree Re-routing," the target node performs a dramatic "Zoom and Slide" transition. The camera tracks the node as it detaches from its origin and flies to its new destination, providing a visual breadcrumb trail so the user never loses track of a person in a large dataset.

- **Dampened Canvas Interaction:** Canvas panning uses a smooth-dampened algorithm that simulates inertia, making navigation feel premium and responsive. Selecting a search result triggers a camera pan that decelerates gracefully as it centers on the target person.

## 3. Interaction Design: The Power User Interface

### A. The Dual-Settings Architecture

To balance ease of use with professional-grade design flexibility, the UI is split into two specialized settings environments:

1. **High-Level Settings (The "Grand Strategy" View):**

    - **Project Management:** Tools for renaming the project, managing version history, and executing a total canvas wipe (which resets the state to a single blank node for starting over).

    - **Global Layout Toggles:** This houses the primary switch for "Auto-Align" mode. Disabling this unlocks "Art-Board Mode," allowing users to drag nodes anywhere on the infinite canvas. Re-enabling it triggers a stern modal warning: "All manual positioning will be lost; the system will snap 450 nodes back to their generational rows."

    - **Governance:** Management of tree-wide privacy (Public vs. Private) and the collaborative invitation list.

2. **Canvas-Level Settings (The "Designer" Toolbar):**

    - **The Design Palette:** Real-time sliders for node height/width, border-radius (Circle vs. Square), and thematic color palettes (e.g., "Classic Parchment" vs. "High-Contrast Dark").

    - **Density Sliders:** Fine-tuned controls for the spacing buffer between spouses, the horizontal gap between siblings, and the vertical "generation gap" between rows.

    - **Advanced Selection:** One-click shortcuts for "Select Subtree" (all descendants) and a toggle for the "Lasso Tool" for freehand group selection.

### B. The Command Center Side Panel

- **Information Architecture:** The panel is divided into three functional tabs:

    - **Basic Info:** Name, dates, location of birth, and profile image uploads.

    - **Relationships:** A managed list of partners and children with "Click-to-Focus" shortcuts.

    - **History & Meta:** A log of who edited this node and when, along with specific metadata like "Adopted" or "Deceased" toggles.

- **The Parent Swap & Naming Logic:** A specialized tool allows users to swap the "Mother" and "Father" slots within a Union Node. This is more than a visual swap; if the child’s family name is still set to the "System Default," the software will automatically update the child's surname to match the individual moved into the "Father" slot.

- **Subtree Re-routing:** A powerful "Move" tool. Users can search for new parents for an existing node. Upon confirmation, that node—and its entire downward branch of descendants—will "detach" and fly to their new logical home in a different subtree.

### C. Omnidirectional Growth & Interaction

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

- **The Trash Can:** All deleted items are moved to a "Trash" repository, recoverable for 30 days. This provides a safety net far more robust than a simple "Undo" button.

- **Duplicate Integrity:** When deleting a "Virtual Duplicate," the system forces a choice: "Delete only this visual instance, or erase this person's data entirely from the platform?"

### B. Tree Fusion (The "Wiki" Merge)

- **Compare & Merge Workflow:** Dragging Node A onto Node B initiates a fusion protocol. A side-by-side comparison modal appears, highlighting discrepancies in birth dates or locations. The user must resolve these (e.g., "Keep Birthdate from Node A") before the two subtrees are permanently fused.

- **Permission Guards:** Merging a public branch into a "Locked" private branch triggers an "Approval Request" to the Owner, ensuring that collaborators cannot overwrite curated historical data without oversight.

## 6. Collaboration, Privacy & Platform Scaling

A. Governance & Permissions

- **Role-Based Access:** The Owner holds "God Mode" (deleting the tree, transferring ownership). Collaborators are invited via email and assigned "View Only" or "Editor" roles.

- **Subtree Locking:** For large collaborative projects, Owners can "Lock" specific historical branches. Locked nodes are rendered with 40% opacity, and the side panel disables all editing fields for those individuals, effectively "freezing" that part of the tree.

### B. Performance for Massive Datasets

- **Level of Detail (LOD) Rendering:** To handle trees with 10,000+ individuals, the software uses dynamic rendering. At 100% zoom, full SVG detail and photos are rendered. At 20% zoom, nodes collapse into simple colored rectangles to maintain a silky-smooth 60fps performance on lower-end hardware.

- **Advanced Filtered Search:** The search bar supports regex and metadata filters (e.g., "Find all Smiths born in London between 1850 and 1900"). Results feature mini-thumbnails to help distinguish between relatives with identical names.

## 7. Technical Stack Summary

- **Frontend:** React.js for UI, Zustand for high-performance state management, and React Flow as the core graph engine.

- **Animation:** React Spring or Framer Motion for all coordinate-based shifts.

- **Backend:** Node.js (Express) handling API requests and Google/Email auth via NextAuth.js.

- **Database:** PostgreSQL provides the relational power needed for complex DAG ID linking and parent-child associations.

- **Storage:** Cloudinary or AWS S3 for optimized, responsive profile image hosting.

## 8. Security Architecture

Security is enforced at the database layer first and the application layer second. Client-side code is never trusted as a security boundary.

### A. Authentication

- **Supabase Auth is a hard prerequisite** before any data write path is built. No feature that touches the database ships without an authenticated user context. Google/Email OAuth is the minimum viable auth implementation and must be wired up in Sprint 1 alongside the schema — not deferred to Sprint 11.
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
- Accepted MIME types (`image/jpeg`, `image/png`, `image/webp`) are validated server-side. Frontend file-type checks are UX only and are not relied upon for security.
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