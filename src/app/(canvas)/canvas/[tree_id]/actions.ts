"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

export async function getCanvasData(treeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load tree, persons, union_nodes, and edges in parallel
  const [treeResult, personsResult, unionsResult, edgesResult] =
    await Promise.all([
      supabase.from("trees").select("*").eq("id", treeId).single(),
      supabase
        .from("persons")
        .select("*")
        .eq("tree_id", treeId)
        .eq("is_deleted", false),
      supabase
        .from("union_nodes")
        .select("*")
        .eq("tree_id", treeId)
        .eq("is_deleted", false),
      supabase
        .from("edges")
        .select("*, union_nodes!inner(tree_id)")
        .eq("union_nodes.tree_id", treeId),
    ]);

  if (treeResult.error || !treeResult.data) notFound();

  return {
    tree: treeResult.data,
    persons: personsResult.data ?? [],
    unions: unionsResult.data ?? [],
    edges: edgesResult.data ?? [],
  };
}

export async function saveViewport(
  treeId: string,
  viewport: { x: number; y: number; zoom: number }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("trees")
    .update({
      legend_config: { viewport },
      updated_at: new Date().toISOString(),
    })
    .eq("id", treeId);
}

export async function saveNodePosition(
  personId: string,
  treeId: string,
  x: number,
  y: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("persons")
    .update({ canvas_x: x, canvas_y: y })
    .eq("id", personId)
    .eq("tree_id", treeId);

  revalidatePath(`/canvas/${treeId}`);
}
