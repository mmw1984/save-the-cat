import "server-only";

import { normalizeEmail } from "./http";
import { createAdminClient } from "./supabase";

/**
 * Blacklisted accounts cannot sign in, and any existing session is treated
 * as logged out everywhere readSession is used.
 *
 * If the table does not exist yet (migration pending) this fails open so
 * the site keeps working for everyone else.
 */
export async function isBlacklisted(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blacklist")
    .select("email")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) return false;
  return data !== null;
}
