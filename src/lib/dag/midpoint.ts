/**
 * Sprint 3: Midpoint calculation.
 *
 * A Union Node is an invisible anchor positioned at the precise midpoint
 * between two partners (Master Spec §2A). Pure coordinate math — no
 * knowledge of persons, trees, or React Flow.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Positions a union node between its two partners.
 *
 * Genealogy data is frequently incomplete (unknown parent) — a union node
 * with only one known partner position sits at that partner's position
 * rather than failing.
 */
export function calculateMidpoint(
  partner1: Point | null,
  partner2: Point | null
): Point {
  if (partner1 && partner2) {
    return {
      x: (partner1.x + partner2.x) / 2,
      y: (partner1.y + partner2.y) / 2,
    };
  }
  if (partner1) return { x: partner1.x, y: partner1.y };
  if (partner2) return { x: partner2.x, y: partner2.y };
  return { x: 0, y: 0 };
}
