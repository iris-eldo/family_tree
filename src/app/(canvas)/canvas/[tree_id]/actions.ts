"use server";

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export async function getCanvasData(treeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load tree, persons, and union_nodes in parallel first
  const [treeResult, personsResult, unionsResult] = await Promise.all([
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
  ]);

  if (treeResult.error || !treeResult.data) notFound();

  // Fetch edges filtered to this tree's union_nodes (using .in() — no fragile join syntax)
  const unionIds = (unionsResult.data ?? []).map((u) => u.id);
  const edgesResult = unionIds.length > 0
    ? await supabase.from("edges").select("*").in("union_node_id", unionIds)
    : { data: [] };

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

  // No revalidatePath — canvas state lives in Zustand; RSC cache invalidation
  // on every node drag would be wasteful and fight the client-side store.
  await supabase
    .from("persons")
    .update({ canvas_x: x, canvas_y: y })
    .eq("id", personId)
    .eq("tree_id", treeId);
}
