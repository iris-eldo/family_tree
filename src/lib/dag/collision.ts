/**
 * Sprint 4: Axis-aligned bounding-box collision detection.
 *
 * Returns every pair of nodes whose rectangles overlap. "Overlap" means the
 * intersection area is strictly positive — nodes that merely touch (share an
 * edge) are not considered colliding.
 *
 * Framework-agnostic: takes plain rectangles, returns plain data.
 */

export interface NodeRect {
  id: string;
  x: number; // left edge
  y: number; // top edge
  width: number;
  height: number;
}

export interface Collision {
  aId: string;
  bId: string;
  /** Horizontal overlap distance (positive = they intersect by this many px). */
  overlapX: number;
  /** Vertical overlap distance (positive = they intersect by this many px). */
  overlapY: number;
}

/**
 * O(n²) scan — acceptable for trees up to ~500 visible nodes per generation.
 * Sprint 10 can introduce a spatial index (e.g. R-tree) if profiling shows
 * this becoming a bottleneck on 5 000-node trees.
 */
export function detectCollisions(nodes: NodeRect[]): Collision[] {
  const collisions: Collision[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];

      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

      if (overlapX > 0 && overlapY > 0) {
        collisions.push({ aId: a.id, bId: b.id, overlapX, overlapY });
      }
    }
  }

  return collisions;
}
