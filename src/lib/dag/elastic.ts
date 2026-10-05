/**
 * Sprint 4: Elastic layout — push adjacent subtrees to prevent overlap.
 *
 * When a node is dragged to a new position, any sibling nodes (same
 * generation, same parent union) that now overlap it are pushed horizontally
 * outward. The push propagates downward through each sibling's entire
 * subtree so that descendant nodes stay anchored below their parents.
 *
 * Master Spec §2C: "The software dynamically pushes all adjacent subtrees
 * outward in real-time … nodes and lines never overlap."
 *
 * Framework-agnostic: pure coordinate math, no React or React Flow imports.
 */

import { type NodeRect } from "./collision";

/** A directed parent→child link used to identify and propagate subtrees. */
export interface SubtreeLink {
  parentId: string;
  childId: string;
}

/**
 * Compute the horizontal shifts needed to push all nodes that overlap the
 * moved node (and their subtrees) to maintain at least `minGap` pixels of
 * horizontal spacing between every pair of sibling rectangles.
 *
 * Returns a Map of nodeId → dx (positive = shift right, negative = left).
 * Only nodes that actually need to move are included; the moved node itself
 * is never in the result.
 *
 * The caller is responsible for applying the returned deltas to its own
 * position state — this function is pure and has no side effects.
 *
 * @param nodes      Current bounding rectangles for all visible nodes.
 * @param links      Parent→child pairs that define subtree structure.
 * @param movedId    ID of the node that was just repositioned.
 * @param minGap     Minimum horizontal gap to enforce between siblings (px).
 */
export function elasticShift(
  nodes: NodeRect[],
  links: SubtreeLink[],
  movedId: string,
  minGap = 40
): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const moved = byId.get(movedId);
  if (!moved) return new Map();

  // Build children map for subtree propagation.
  const childrenOf = new Map<string, string[]>();
  for (const { parentId, childId } of links) {
    const list = childrenOf.get(parentId) ?? [];
    list.push(childId);
    childrenOf.set(parentId, list);
  }

  // Build siblings map: nodes that share the same y-band as the moved node.
  // "Same y-band" = their vertical ranges overlap (they are on the same
  // generational row). We use the moved node's y-center ± half-height as
  // the band tolerance so that minor float drift doesn't split siblings.
  const movedCenterY = moved.y + moved.height / 2;
  const siblings = nodes.filter(
    (n) =>
      n.id !== movedId &&
      n.y <= movedCenterY + moved.height / 2 &&
      n.y + n.height >= movedCenterY - moved.height / 2
  );

  const shifts = new Map<string, number>();

  for (const sibling of siblings) {
    // Horizontal gap between moved node and this sibling.
    const gapRight = sibling.x - (moved.x + moved.width); // sibling is to the right
    const gapLeft = moved.x - (sibling.x + sibling.width); // sibling is to the left

    let dx = 0;

    if (sibling.x >= moved.x) {
      // Sibling is to the right: push further right if gap is insufficient.
      if (gapRight < minGap) dx = minGap - gapRight;
    } else {
      // Sibling is to the left: push further left.
      if (gapLeft < minGap) dx = -(minGap - gapLeft);
    }

    if (dx === 0) continue;

    // Apply shift to this sibling and its entire subtree.
    applyShiftToSubtree(sibling.id, dx, childrenOf, shifts);
  }

  return shifts;
}

/**
 * Recursively records `dx` for a node and all of its descendants.
 * If a node already has a recorded shift, the new value replaces it
 * (the largest shift wins — avoids under-shifting when multiple ancestors
 * push the same descendant).
 */
function applyShiftToSubtree(
  nodeId: string,
  dx: number,
  childrenOf: Map<string, string[]>,
  shifts: Map<string, number>
): void {
  const existing = shifts.get(nodeId);
  // Keep the shift with the larger absolute magnitude.
  if (existing === undefined || Math.abs(dx) > Math.abs(existing)) {
    shifts.set(nodeId, dx);
  }

  for (const childId of childrenOf.get(nodeId) ?? []) {
    applyShiftToSubtree(childId, dx, childrenOf, shifts);
  }
}
