import "server-only";

import { normalizeEmail } from "./http";
import { createAdminClient } from "./supabase";

/**
 * Blacklisted accounts cannot sign in, and any existing session is treated
 * as logged out everywhere readSession is used.
 *
 * Failure policy:
 * - No Supabase configured (demo mode): no backend means no blacklist, so
 *   the lookup is skipped entirely.
 * - Table missing (fresh deploy before the migration has run): fails open
 *   so the site keeps working for everyone.
 * - Any other error (transient outage, permissions): throws — callers treat
 *   the account as unauthenticated rather than admit a potentially banned
 *   user.
 */
export async function isBlacklisted(email: string): Promise<boolean> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blacklist")
    .select("email")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) {
    // PGRST205/42P01 = relation missing from the schema cache or database.
    if (error.code === "PGRST205" || error.code === "42P01" || error.code === "404") {
      return false;
    }
    throw new Error(`Blacklist check failed: ${error.message}`);
  }
  return data !== null;
}
