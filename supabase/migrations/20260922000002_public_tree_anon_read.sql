-- ============================================================
-- Sprint 1B follow-up: anon read access to PUBLIC tree content
--
-- Master Spec §6A: "Public: Anyone with the shareable link can view
-- the tree read-only — no account required."
--
-- The original RLS migration (20260922000001) only granted the anon
-- role a SELECT policy on `trees` itself ("trees: select public").
-- persons/union_nodes/edges/person_aliases had no anon policy at all,
-- so an anonymous visitor to a public tree's link could see that the
-- tree exists but zero people or relationships in it — breaking both
-- the public-link feature and the Sprint 1A seed tree's stated purpose
-- as "the data used for the public landing page demo tree."
--
-- Editing remains authenticated-only regardless of privacy (unchanged
-- by this migration) — these are SELECT-only policies for the anon role.
-- ============================================================

-- Helper: true if the tree is public. Mirrors user_can_access_tree()'s
-- style so anon policies read the same way as the authenticated ones.
CREATE OR REPLACE FUNCTION tree_is_public(p_tree_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trees
    WHERE id = p_tree_id
      AND privacy = 'public'
  );
$$;

-- ─── persons ──────────────────────────────────────────────────────────────
CREATE POLICY "persons: select public"
  ON persons FOR SELECT
  TO anon
  USING (tree_is_public(tree_id));

-- ─── union_nodes ──────────────────────────────────────────────────────────
CREATE POLICY "union_nodes: select public"
  ON union_nodes FOR SELECT
  TO anon
  USING (tree_is_public(tree_id));

-- ─── edges ────────────────────────────────────────────────────────────────
-- edges has no tree_id directly — join through union_nodes, same pattern
-- as the authenticated "edges: select" policy.
CREATE POLICY "edges: select public"
  ON edges FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM union_nodes u
      WHERE u.id = union_node_id
        AND tree_is_public(u.tree_id)
    )
  );

-- ─── person_aliases ───────────────────────────────────────────────────────
CREATE POLICY "person_aliases: select public"
  ON person_aliases FOR SELECT
  TO anon
  USING (tree_is_public(tree_id));
