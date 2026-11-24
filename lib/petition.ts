import "server-only";

import { ApiError } from "./http";
import type { Session } from "./session";
import { createAdminClient } from "./supabase";

export type PetitionContent = {
  title: string;
  body: string;
  goalCount: number;
};

export type Signature = {
  name: string;
  signedAt: string;
};

export type SignatureWithEmail = Signature & { email: string };

/** No Supabase env → in-memory demo mode so the UI renders without a backend. */
function hasDb(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const demoSignatures: SignatureWithEmail[] = [];

const FALLBACK_CONTENT: PetitionContent = {
  title: "拯救校貓行動 · Save the Cat",
  body: "我哋係中華基督教會何福堂書院嘅學生。學校打算移除照顧咗五年嘅校貓「阿福」，我哋希望校方重新考慮，等阿福可以繼續留喺校園。\n\n如果你都想阿福留低，請用學校 Google 帳號喺下面簽名支持。",
  goalCount: 2000,
};

export async function getPetitionContent(): Promise<PetitionContent> {
  if (!hasDb()) return FALLBACK_CONTENT;
  const { data } = await createAdminClient()
    .from("petition_content")
    .select("title, body, goal_count")
    .eq("id", true)
    .maybeSingle();
  if (!data) return FALLBACK_CONTENT;
  return { title: data.title, body: data.body, goalCount: data.goal_count ?? 0 };
}

export async function getSignatureCount(): Promise<number> {
  if (!hasDb()) return demoSignatures.length;
  const { count } = await createAdminClient()
    .from("signatures")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function listSignatures(limit: number, offset: number): Promise<Signature[]> {
  if (!hasDb()) return demoSignatures.slice(offset, offset + limit);
  const { data } = await createAdminClient()
    .from("signatures")
    .select("name, signed_at")
    .order("signed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((row) => ({ name: row.name, signedAt: row.signed_at }));
}

/** Idempotent: a second sign by the same email reports already-signed. */
export async function signPetition(
  session: Session,
): Promise<{ alreadySigned: boolean; count: number }> {
  if (!hasDb()) {
    const alreadySigned = demoSignatures.some((s) => s.email === session.email);
    if (!alreadySigned) {
      demoSignatures.unshift({
        email: session.email,
        name: session.name,
        signedAt: new Date().toISOString(),
      });
    }
    return { alreadySigned, count: demoSignatures.length };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("signatures")
    .insert({ email: session.email, name: session.name });
  if (error && error.code !== "23505") {
    throw new ApiError(500, "Signature could not be saved. Try again.");
  }
  const count = await getSignatureCount();
  return { alreadySigned: error?.code === "23505", count };
}

export async function hasSigned(email: string): Promise<boolean> {
  if (!hasDb()) return demoSignatures.some((s) => s.email === email);
  const { data } = await createAdminClient()
    .from("signatures")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return data !== null;
}

export async function isAdmin(email: string): Promise<boolean> {
  if (!hasDb()) return false;
  const { data } = await createAdminClient()
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  return data !== null;
}

export async function listSignaturesWithEmails(
  limit: number,
  offset: number,
): Promise<SignatureWithEmail[]> {
  if (!hasDb()) return demoSignatures.slice(offset, offset + limit);
  const { data } = await createAdminClient()
    .from("signatures")
    .select("name, email, signed_at")
    .order("signed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((row) => ({
    name: row.name,
    email: row.email,
    signedAt: row.signed_at,
  }));
}
