"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTree(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Tree name is required." };

  const { data: tree, error } = await supabase
    .from("trees")
    .insert({ name, creator_id: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect(`/canvas/${tree.id}`);
}

export async function getTrees() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("trees")
    .select("id, name, updated_at, privacy")
    .order("updated_at", { ascending: false });

  return data ?? [];
}
