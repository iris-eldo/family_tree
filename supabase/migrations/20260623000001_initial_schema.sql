-- ============================================================
-- Sprint 1A: Initial Schema
-- Family Tree App — Relationship-Centric DAG Architecture
--
-- ltree path convention: <tree_id>.<union_id>.<person_id>
--
-- IMPORTANT — UUID format in ltree paths:
--   PostgreSQL ltree labels do NOT allow hyphens. UUID values
--   must have hyphens removed before use as path segments.
--   Use: replace(id::text, '-', '')
--   Example: 'a1b2c3d4e5f6...' (32 hex chars, no hyphens)
--   This produces valid ltree labels like:
--     a1b2c3d4e5f64a1b8c2d3e4f5a6b7c8d.f1e2d3c4b5a64f3e2d1c0b9a8f7e6d5c.9a8b7c6d5e4f...
--
-- All audit fields (created_by, last_edited_by) are populated
-- by the set_audit_fields() trigger in Sprint 1B — columns
-- exist here so the schema is stable before RLS is written.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- ─── trees ────────────────────────────────────────────────────────────────
CREATE TABLE trees (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  -- creator_id is immutable after creation. Only the creator can delete
  -- the tree or transfer creator status. The creator always retains
  -- Owner-level access, enforced via RLS in Sprint 1B:
  --   trees.creator_id = auth.uid()  (no tree_collaborators row required).
  creator_id      uuid NOT NULL,
  privacy         text NOT NULL DEFAULT 'private' CHECK (privacy IN ('public', 'private')),
  legend_config   jsonb,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  last_edited_by  uuid
);

-- ─── persons ──────────────────────────────────────────────────────────────
-- Note: tree_id is not in the original spec column list but is required here.
-- Without it, RLS policies would need to parse the ltree path column to find
-- the owning tree, which is fragile. A direct FK is cleaner and faster.
CREATE TABLE persons (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id           uuid NOT NULL REFERENCES trees(id),
  first_name        text NOT NULL,
  last_name         text,
  birth_date        date,
  birth_location    text,
  death_date        date,
  death_location    text,
  is_living         boolean NOT NULL DEFAULT true,
  -- generation_index is computed by the DAG engine in Sprint 3
  generation_index  integer,
  -- canvas_x / canvas_y: node position for viewport persistence and Realtime sync
  canvas_x          float,
  canvas_y          float,
  profile_image_url text,
  -- ltree path: <tree_id>.<union_id>.<person_id>
  path              ltree,
  -- Full-text search: generated column, indexed with GIN for Sprint 10 search
  search_vector     tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) STORED,
  -- Soft delete: never hard-delete; deleted_at drives 30-day GDPR purge
  is_deleted        boolean NOT NULL DEFAULT false,
  deleted_at        timestamptz,
  created_by        uuid,
  last_edited_by    uuid,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX persons_search_idx ON persons USING GIN (search_vector);
CREATE INDEX persons_path_idx   ON persons USING GIST (path);
CREATE INDEX persons_tree_idx   ON persons (tree_id);

-- ─── union_nodes ──────────────────────────────────────────────────────────
-- Represents a partnership (marriage, domestic partnership, etc.)
-- Children connect to a union_node, not directly to a person.
-- Note: tree_id added for same reason as persons — RLS efficiency.
CREATE TABLE union_nodes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id           uuid NOT NULL REFERENCES trees(id),
  partner_1_id      uuid REFERENCES persons(id),
  partner_2_id      uuid REFERENCES persons(id),
  relationship_type text NOT NULL DEFAULT 'married'
                    CHECK (relationship_type IN ('married', 'partners', 'custom')),
  canvas_x          float,
  canvas_y          float,
  path              ltree,
  is_deleted        boolean NOT NULL DEFAULT false,
  deleted_at        timestamptz,
  created_by        uuid,
  last_edited_by    uuid,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX union_nodes_path_idx ON union_nodes USING GIST (path);
CREATE INDEX union_nodes_tree_idx ON union_nodes (tree_id);

-- ─── edges ────────────────────────────────────────────────────────────────
-- Connects a child person to a union_node (not directly to parents)
CREATE TABLE edges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  union_node_id   uuid NOT NULL REFERENCES union_nodes(id),
  child_person_id uuid NOT NULL REFERENCES persons(id),
  edge_type       text NOT NULL DEFAULT 'biological'
                  CHECK (edge_type IN ('biological', 'adopted', 'foster', 'guardian')),
  created_by      uuid,
  last_edited_by  uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (union_node_id, child_person_id)
);

CREATE INDEX edges_union_idx ON edges (union_node_id);
CREATE INDEX edges_child_idx ON edges (child_person_id);

-- ─── tree_collaborators ───────────────────────────────────────────────────
-- Stores all role-based access grants, including co-owners.
-- The Creator does NOT need a row here — see trees.creator_id RLS clause.
CREATE TABLE tree_collaborators (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id       uuid NOT NULL REFERENCES trees(id),
  user_id       uuid,
  role          text NOT NULL CHECK (role IN ('owner', 'editor', 'view_only')),
  -- Signed token stored at invite time; validated on invite link click
  invite_token  text,
  invited_at    timestamptz NOT NULL DEFAULT now(),
  accepted_at   timestamptz,
  created_by    uuid,
  last_edited_by uuid,
  UNIQUE (tree_id, user_id)
);

CREATE INDEX tree_collaborators_tree_idx ON tree_collaborators (tree_id);
CREATE INDEX tree_collaborators_user_idx ON tree_collaborators (user_id);

-- ─── branch_locks ─────────────────────────────────────────────────────────
-- Locks a specific ltree subtree path for a given tree.
CREATE TABLE branch_locks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id         uuid NOT NULL REFERENCES trees(id),
  path            ltree NOT NULL,
  locked_by       uuid NOT NULL,
  locked_at       timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  last_edited_by  uuid
);

CREATE INDEX branch_locks_path_idx ON branch_locks USING GIST (path);
CREATE INDEX branch_locks_tree_idx ON branch_locks (tree_id);

-- ─── person_aliases ───────────────────────────────────────────────────────
-- Virtual duplicates for consanguineous marriages / multi-branch appearances.
-- A single canonical persons row exists with one authoritative path.
-- person_aliases stores additional display_path entries for alias placements.
-- All edits route to the canonical person record.
CREATE TABLE person_aliases (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_person_id  uuid NOT NULL REFERENCES persons(id),
  display_path         ltree NOT NULL,
  tree_id              uuid NOT NULL REFERENCES trees(id),
  created_by           uuid,
  last_edited_by       uuid,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX person_aliases_canonical_idx ON person_aliases (canonical_person_id);
CREATE INDEX person_aliases_tree_idx      ON person_aliases (tree_id);

-- ─── notifications ────────────────────────────────────────────────────────
-- In-app notification store for Owner approval requests and system alerts.
-- Append-only: last_edited_by is intentionally omitted (records never change).
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  tree_id     uuid REFERENCES trees(id),
  type        text NOT NULL,
  payload     jsonb,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- created_by tracks who triggered the notification (e.g. who requested the merge)
  created_by  uuid
);

CREATE INDEX notifications_user_idx ON notifications (user_id);
CREATE INDEX notifications_tree_idx ON notifications (tree_id);
