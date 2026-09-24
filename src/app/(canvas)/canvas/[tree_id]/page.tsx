import { getCanvasData } from "./actions";
import { FamilyCanvas } from "@/components/canvas/family-canvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ tree_id: string }>;
}) {
  const { tree_id } = await params;
  const { tree, persons, unions, edges } = await getCanvasData(tree_id);

  // Viewport is stored in legend_config.viewport (a jsonb column repurposed
  // for this until a dedicated viewport column is added in a later migration)
  const savedViewport =
    (tree.legend_config as { viewport?: { x: number; y: number; zoom: number } } | null)
      ?.viewport ?? null;

  return (
    <FamilyCanvas
      treeId={tree_id}
      persons={persons}
      unions={unions}
      dbEdges={edges}
      savedViewport={savedViewport}
    />
  );
}
