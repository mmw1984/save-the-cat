import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "./env";

let admin: SupabaseClient | null = null;

/** Service-role client. Never import this module from a client component. */
export function createAdminClient(): SupabaseClient {
  if (admin) return admin;
  admin = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return admin;
}
