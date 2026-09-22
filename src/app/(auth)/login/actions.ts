"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next ?? "/dashboard")}`,
    },
  });

  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}

export async function signInWithMagicLink(formData: FormData, next?: string) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next ?? "/dashboard")}`,
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
