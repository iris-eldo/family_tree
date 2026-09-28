/**
 * Sprint 3: Initial layout — starting canvas_x/canvas_y from generation_index.
 *
 * This is a starting layout only: it spaces persons within a generation
 * row so they don't start out overlapping. Sprint 4's elastic layout
 * engine (Master Spec §2C) owns collision detection and dynamically
 * shifting subtrees when the tree changes; this module does not attempt
 * that — it's the baseline Sprint 4 builds on top of.
 *
 * Sibling order within a generation is caller-controlled (pass persons in
 * the order they should appear left-to-right); this module does not infer
 * grouping by union node.
 */

export const HORIZONTAL_SPACING = 280;
export const VERTICAL_SPACING = 180;

export interface LayoutInput {
  personId: string;
  generationIndex: number;
}

export interface LayoutPosition {
  personId: string;
  x: number;
  y: number;
}

export function calculateInitialLayout(
  persons: LayoutInput[]
): LayoutPosition[] {
  const indexWithinGeneration = new Map<number, number>();
  const positions: LayoutPosition[] = [];

  for (const person of persons) {
    const column = indexWithinGeneration.get(person.generationIndex) ?? 0;
    positions.push({
      personId: person.personId,
      x: column * HORIZONTAL_SPACING,
      y: person.generationIndex * VERTICAL_SPACING,
    });
    indexWithinGeneration.set(person.generationIndex, column + 1);
  }

  return positions;
}
