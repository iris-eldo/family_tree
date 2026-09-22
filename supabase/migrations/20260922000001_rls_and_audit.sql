-- ============================================================
-- Sprint 1B: RLS Policies + Audit Trigger
-- Family Tree App — Relationship-Centric DAG Architecture
--
-- Security model:
--   - Every table has RLS enabled from this migration forward.
--   - Access is determined by tree_collaborators role OR creator_id.
--   - Creator clause: trees.creator_id = auth.uid() grants full
--     access on the trees table even with no tree_collaborators row.
--     This prevents accidental lockout if a collaborator row is deleted.
--   - created_by and last_edited_by are NEVER accepted from the client.
--     The set_audit_fields() trigger sets them from auth.uid() only.
-- ============================================================

-- ─── Audit trigger ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_audit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Always overwrite — never trust client-supplied values
    NEW.created_by    := auth.uid();
    NEW.last_edited_by := auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    -- Preserve original creator; only update last_edited_by
    NEW.created_by    := OLD.created_by;
    NEW.last_edited_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Apply trigger to every table that has audit fields.
-- notifications only has created_by (append-only; no UPDATE path).

CREATE TRIGGER audit_trees
  BEFORE INSERT OR UPDATE ON trees
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_persons
  BEFORE INSERT OR UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_union_nodes
  BEFORE INSERT OR UPDATE ON union_nodes
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_edges
  BEFORE INSERT OR UPDATE ON edges
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_tree_collaborators
  BEFORE INSERT OR UPDATE ON tree_collaborators
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_branch_locks
  BEFORE INSERT OR UPDATE ON branch_locks
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

CREATE TRIGGER audit_person_aliases
  BEFORE INSERT OR UPDATE ON person_aliases
  FOR EACH ROW EXECUTE FUNCTION set_audit_fields();

-- notifications: INSERT only (no UPDATE trigger — append-only table)
CREATE OR REPLACE FUNCTION set_notification_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_notifications
  BEFORE INSERT ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_notification_created_by();

-- ─── Enable RLS on all tables ────────────────────────────────────────────────

ALTER TABLE trees               ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE union_nodes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_collaborators  ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_locks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_aliases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- ─── Helper: check if the current user has access to a tree ──────────────────
-- Returns true if the user is the creator OR has a tree_collaborators row.
-- Used in policies below to avoid repeating the subquery everywhere.

CREATE OR REPLACE FUNCTION user_can_access_tree(p_tree_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trees
    WHERE id = p_tree_id
      AND (
        creator_id = auth.uid()
        OR id IN (
          SELECT tree_id FROM tree_collaborators
          WHERE user_id = auth.uid()
        )
      )
  );
$$;

-- Helper: check if user can write (creator, owner, or editor role)
CREATE OR REPLACE FUNCTION user_can_write_tree(p_tree_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trees
    WHERE id = p_tree_id
      AND (
        creator_id = auth.uid()
        OR id IN (
          SELECT tree_id FROM tree_collaborators
          WHERE user_id = auth.uid()
            AND role IN ('owner', 'editor')
        )
      )
  );
$$;

-- ─── trees policies ──────────────────────────────────────────────────────────

-- Creator clause: creator_id = auth.uid() grants full access without needing
-- a tree_collaborators row. This is the critical lockout-prevention guard.

CREATE POLICY "trees: select own or collaborating"
  ON trees FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR id IN (
      SELECT tree_id FROM tree_collaborators WHERE user_id = auth.uid()
    )
  );

-- Public trees are visible to everyone (including anon) — read-only
CREATE POLICY "trees: select public"
  ON trees FOR SELECT
  TO anon
  USING (privacy = 'public');

CREATE POLICY "trees: insert own"
  ON trees FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "trees: update own or owner-role"
  ON trees FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR id IN (
      SELECT tree_id FROM tree_collaborators
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR id IN (
      SELECT tree_id FROM tree_collaborators
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Only the original creator can delete the tree
CREATE POLICY "trees: delete creator only"
  ON trees FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- ─── persons policies ─────────────────────────────────────────────────────────

CREATE POLICY "persons: select"
  ON persons FOR SELECT
  TO authenticated
  USING (user_can_access_tree(tree_id));

CREATE POLICY "persons: insert"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "persons: update"
  ON persons FOR UPDATE
  TO authenticated
  USING (user_can_write_tree(tree_id))
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "persons: delete"
  ON persons FOR DELETE
  TO authenticated
  USING (user_can_write_tree(tree_id));

-- ─── union_nodes policies ─────────────────────────────────────────────────────

CREATE POLICY "union_nodes: select"
  ON union_nodes FOR SELECT
  TO authenticated
  USING (user_can_access_tree(tree_id));

CREATE POLICY "union_nodes: insert"
  ON union_nodes FOR INSERT
  TO authenticated
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "union_nodes: update"
  ON union_nodes FOR UPDATE
  TO authenticated
  USING (user_can_write_tree(tree_id))
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "union_nodes: delete"
  ON union_nodes FOR DELETE
  TO authenticated
  USING (user_can_write_tree(tree_id));

-- ─── edges policies ───────────────────────────────────────────────────────────
-- edges has no tree_id directly — join through union_nodes

CREATE POLICY "edges: select"
  ON edges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND user_can_access_tree(u.tree_id)
    )
  );

CREATE POLICY "edges: insert"
  ON edges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND user_can_write_tree(u.tree_id)
    )
  );

CREATE POLICY "edges: update"
  ON edges FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND user_can_write_tree(u.tree_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND user_can_write_tree(u.tree_id)
    )
  );

CREATE POLICY "edges: delete"
  ON edges FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND user_can_write_tree(u.tree_id)
    )
  );

-- ─── tree_collaborators policies ──────────────────────────────────────────────

-- Users can see collaborators for trees they're in
CREATE POLICY "tree_collaborators: select"
  ON tree_collaborators FOR SELECT
  TO authenticated
  USING (user_can_access_tree(tree_id));

-- Only owners/creators can add collaborators
CREATE POLICY "tree_collaborators: insert"
  ON tree_collaborators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trees t
      WHERE t.id = tree_id
        AND (
          t.creator_id = auth.uid()
          OR tree_id IN (
            SELECT tc.tree_id FROM tree_collaborators tc
            WHERE tc.user_id = auth.uid() AND tc.role = 'owner'
          )
        )
    )
  );

-- Users can update their own row (e.g. accept invite); owners can update any
CREATE POLICY "tree_collaborators: update"
  ON tree_collaborators FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM trees t
      WHERE t.id = tree_id
        AND (
          t.creator_id = auth.uid()
          OR tree_id IN (
            SELECT tc.tree_id FROM tree_collaborators tc
            WHERE tc.user_id = auth.uid() AND tc.role = 'owner'
          )
        )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM trees t
      WHERE t.id = tree_id
        AND (
          t.creator_id = auth.uid()
          OR tree_id IN (
            SELECT tc.tree_id FROM tree_collaborators tc
            WHERE tc.user_id = auth.uid() AND tc.role = 'owner'
          )
        )
    )
  );

-- Only owners/creators can remove collaborators
CREATE POLICY "tree_collaborators: delete"
  ON tree_collaborators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trees t
      WHERE t.id = tree_id
        AND (
          t.creator_id = auth.uid()
          OR tree_id IN (
            SELECT tc.tree_id FROM tree_collaborators tc
            WHERE tc.user_id = auth.uid() AND tc.role = 'owner'
          )
        )
    )
  );

-- ─── branch_locks policies ────────────────────────────────────────────────────

CREATE POLICY "branch_locks: select"
  ON branch_locks FOR SELECT
  TO authenticated
  USING (user_can_access_tree(tree_id));

CREATE POLICY "branch_locks: insert"
  ON branch_locks FOR INSERT
  TO authenticated
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "branch_locks: update"
  ON branch_locks FOR UPDATE
  TO authenticated
  USING (user_can_write_tree(tree_id))
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "branch_locks: delete"
  ON branch_locks FOR DELETE
  TO authenticated
  USING (user_can_write_tree(tree_id));

-- ─── person_aliases policies ──────────────────────────────────────────────────

CREATE POLICY "person_aliases: select"
  ON person_aliases FOR SELECT
  TO authenticated
  USING (user_can_access_tree(tree_id));

CREATE POLICY "person_aliases: insert"
  ON person_aliases FOR INSERT
  TO authenticated
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "person_aliases: update"
  ON person_aliases FOR UPDATE
  TO authenticated
  USING (user_can_write_tree(tree_id))
  WITH CHECK (user_can_write_tree(tree_id));

CREATE POLICY "person_aliases: delete"
  ON person_aliases FOR DELETE
  TO authenticated
  USING (user_can_write_tree(tree_id));

-- ─── notifications policies ───────────────────────────────────────────────────

-- Users can only see their own notifications
CREATE POLICY "notifications: select own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can create notifications for valid trees they can access
CREATE POLICY "notifications: insert"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    tree_id IS NULL OR user_can_access_tree(tree_id)
  );

-- Users can update only their own notifications (e.g. mark as read)
CREATE POLICY "notifications: update own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No DELETE on notifications — they are soft-deleted via read_at / retention policy
