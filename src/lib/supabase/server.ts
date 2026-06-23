import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * Uses the anon key with the user's cookie-based auth session (RLS applies).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — cookie mutation ignored.
            // Middleware handles session refresh instead.
          }
        },
      },
    }
  );
}

/**
 * Admin Supabase client using the service role key. Bypasses RLS entirely.
 * ONLY use in server-only Route Handlers for privileged operations
 * (e.g., account deletion cascade, GDPR purge, scheduled jobs).
 * NEVER import from any file included in the client bundle.
 */
export function createAdminClient() {
  return createAdminSupabase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
