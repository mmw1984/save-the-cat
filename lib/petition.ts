import "server-only";

import { petitionKind } from "./env";
import { ApiError } from "./http";
import type { Session } from "./session";
import { createAdminClient } from "./supabase";

export type PetitionContent = {
  title: string;
  body: string;
  goalCount: number;
};

/**
 * name is present only for viewers who already signed (and for admins);
 * the anonymous public list omits it.
 */
export type Signature = {
  name?: string;
  signedAt: string;
};

export type SignatureWithEmail = Signature & {
  name: string;
  email: string;
  kind: "school" | "public";
  showName: boolean;
};

/** No Supabase env → in-memory demo mode so the UI renders without a backend. */
function hasDb(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const demoSignatures: SignatureWithEmail[] = [];

const FALLBACK_CONTENT: PetitionContent = {
  title: "Save the Cat",
  body: "兩隻貓喺我哋校園住咗一個月，一直俾學生同老師疼錫照顧，我哋好想佢哋留低。\n\n一間 Band 1 學校理應實踐基本嘅透明度，同埋建立真正嘅「生命教育」，可惜呢個決定將兩者完全拋棄。我相信動物唔係有需要先攞出嚟展示、冇需要就靜靜雞拋棄嘅道具。\n\n喺任何倉促而且不可逆轉嘅決定落實之前，我要求校長暫停呢次移走行動，公開同學生討論，例如透過十二月初嘅學生論壇。作為學校社群嘅一員同埋寵物嘅共同主人，我認為我哋值得一個合理嘅解釋，同埋真正嘅發言權。",
  goalCount: 0,
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
  if (!hasDb()) return demoSignatures.filter((s) => s.kind === petitionKind()).length;
  const { count } = await createAdminClient()
    .from("signatures")
    .select("id", { count: "exact", head: true })
    .eq("kind", petitionKind());
  return count ?? 0;
}

export async function listSignatures(
  limit: number,
  offset: number,
  includeNames = false,
): Promise<Signature[]> {
  if (!hasDb()) {
    // Strip emails — this feeds the unauthenticated signature list.
    return demoSignatures
      .filter((s) => s.kind === petitionKind())
      .slice(offset, offset + limit)
      .map((s) => ({
        name:
          petitionKind() === "public" || (includeNames && s.showName)
            ? s.name
            : undefined,
        signedAt: s.signedAt,
      }));
  }
  const { data } = await createAdminClient()
    .from("signatures")
    .select("name, signed_at, show_name")
    .eq("kind", petitionKind())
    .order("signed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((row) => ({
    // Consent gate: on the school petition only signed viewers see names,
    // and only for consenting signers. The public petition shows every
    // name to everyone.
    name:
      petitionKind() === "public" || (includeNames && row.show_name)
        ? row.name
        : undefined,
    signedAt: row.signed_at,
  }));
}

/** Idempotent: a second sign by the same email reports already-signed. */
export async function signPetition(
  session: Session,
  showName: boolean,
): Promise<{ alreadySigned: boolean; count: number }> {
  if (!hasDb()) {
    const alreadySigned = demoSignatures.some(
      (s) => s.email === session.email && s.kind === petitionKind(),
    );
    if (!alreadySigned) {
      demoSignatures.unshift({
        email: session.email,
        name: session.name,
        kind: petitionKind(),
        showName,
        signedAt: new Date().toISOString(),
      });
    }
    return {
      alreadySigned,
      count: demoSignatures.filter((s) => s.kind === petitionKind()).length,
    };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("signatures")
    .insert({
      email: session.email,
      name: session.name,
      kind: petitionKind(),
      show_name: showName,
    });
  if (error && error.code !== "23505") {
    throw new ApiError(500, "Signature could not be saved. Try again.");
  }
  const count = await getSignatureCount();
  return { alreadySigned: error?.code === "23505", count };
}

export async function hasSigned(email: string): Promise<boolean> {
  if (!hasDb()) {
    return demoSignatures.some((s) => s.email === email && s.kind === petitionKind());
  }
  const { data } = await createAdminClient()
    .from("signatures")
    .select("id")
    .eq("email", email)
    .eq("kind", petitionKind())
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
  if (!hasDb()) {
    return demoSignatures
      .filter((s) => s.kind === petitionKind())
      .slice(offset, offset + limit);
  }
  // PostgREST caps a response at ~1000 rows regardless of .range(), so page
  // through. Offset pagination drifts when someone signs mid-export (dupe or
  // skipped rows); keyset on the monotonic id cursor is stable instead.
  const PAGE = 1000;
  const out: SignatureWithEmail[] = [];
  let lastId: number | null = null;
  let remaining = offset;
  while (out.length < limit) {
    const want = Math.min(PAGE, limit + remaining - out.length);
    let query = createAdminClient()
      .from("signatures")
      .select("id, name, email, signed_at, kind, show_name")
      .order("id", { ascending: false })
      .limit(want);
    if (lastId !== null) query = query.lt("id", lastId);
    const { data, error } = await query;
    if (error) throw new ApiError(500, "Signatures could not be loaded.");
    const rows = (data ?? []).slice(remaining);
    remaining = Math.max(0, remaining - (data ?? []).length);
    for (const row of rows) {
      out.push({
        name: row.name,
        email: row.email,
        kind: row.kind === "public" ? "public" : "school",
        showName: row.show_name === true,
        signedAt: row.signed_at,
      });
    }
    const last = data?.[data.length - 1];
    if (!last || data.length < want) break;
    lastId = last.id;
  }
  return out;
}
