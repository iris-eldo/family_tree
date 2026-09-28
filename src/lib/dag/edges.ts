/**
 * Sprint 3: Custom edge logic — solid vs. dashed line styling.
 *
 * The `edges` table's `edge_type` column (biological/adopted/foster/
 * guardian) distinguishes how a child connects to a union node. The
 * Master Spec documents solid-vs-dashed as the visual language for
 * relationship type elsewhere (§2B, for union partner lines); the same
 * convention is applied here for child edges: biological connections are
 * a solid line, and non-biological connections (adopted/foster/guardian)
 * are dashed, so a viewer can tell at a glance which links are biological
 * lineage vs. legal/social guardianship.
 *
 * This returns a plain style descriptor, not a React Flow Edge — kept
 * framework-agnostic so Sprint 2 can map it onto @xyflow/react's Edge
 * type without this package depending on React Flow.
 */

export type FamilyEdgeType = "biological" | "adopted" | "foster" | "guardian";

export interface EdgeStyle {
  /** SVG stroke-dasharray value; undefined means a solid line. */
  strokeDasharray: string | undefined;
}

const SOLID: EdgeStyle = { strokeDasharray: undefined };
const DASHED: EdgeStyle = { strokeDasharray: "6 4" };

export function getEdgeStyle(edgeType: FamilyEdgeType): EdgeStyle {
  switch (edgeType) {
    case "biological":
      return SOLID;
    case "adopted":
    case "foster":
    case "guardian":
      return DASHED;
    default: {
      const exhaustiveCheck: never = edgeType;
      throw new Error(`Unknown edge type: ${exhaustiveCheck as string}`);
    }
  }
}
