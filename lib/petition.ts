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
export type SignerRole = "student" | "alumni" | "staff";

export type Signature = {
  name?: string;
  signedAt: string;
  /** Role label for anonymous rows; 'staff' when the email is not on the roster. */
  role?: SignerRole;
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

export type SignatureCounts = {
  total: number;
  student: number;
  alumni: number;
  staff: number;
};

/** Total + per-role breakdown for the counter line (roster lookup). */
export async function getSignatureCounts(): Promise<SignatureCounts> {
  if (!hasDb()) {
    const total = demoSignatures.filter((s) => s.kind === petitionKind()).length;
    return { total, student: total, alumni: 0, staff: 0 };
  }
  const db = createAdminClient();
  // The exact count comes from a head query — a select response is capped
  // at 1,000 rows, which would silently under-count a bigger petition.
  const { count } = await db
    .from("signatures")
    .select("id", { count: "exact", head: true })
    .eq("kind", petitionKind());
  const counts: SignatureCounts = {
    total: count ?? 0,
    student: 0,
    alumni: 0,
    staff: 0,
  };
  const roster = new Map<string, SignerRole>();
  const PAGE = 1000;
  const CHUNK = 200; // keeps .in() URLs under the gateway's length limit
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await db
      .from("signatures")
      .select("email")
      .eq("kind", petitionKind())
      .order("id") // stable order — without it pages can skip/double rows
      .range(offset, offset + PAGE - 1);
    const page = data ?? [];
    const emails = [...new Set(page.map((r) => String(r.email).toLowerCase()))];
    for (let i = 0; i < emails.length; i += CHUNK) {
      const { data: rosterRows } = await db
        .from("roster")
        .select("email, role")
        .in("email", emails.slice(i, i + CHUNK));
      for (const r of rosterRows ?? []) {
        roster.set(
          String(r.email).toLowerCase(),
          r.role === "alumni" ? "alumni" : "student",
        );
      }
    }
    for (const e of emails) {
      counts[roster.get(e) ?? "staff"] += 1;
    }
    if (page.length < PAGE) break;
  }
  return counts;
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
        role: "student" as const,
      }));
  }
  const { data } = await createAdminClient()
    .from("signatures")
    .select("name, email, signed_at, show_name")
    .eq("kind", petitionKind())
    .order("signed_at", { ascending: false })
    .range(offset, offset + limit - 1);
  const rows = data ?? [];

  // Roles are only needed for anonymous rows on the school petition —
  // anything not on the roster is staff. The public petition shows every
  // name, so pairing it with a school-role label would leak status for no
  // reason. Emails are used server-side only and never serialized.
  const roles = new Map<string, SignerRole>();
  const showNameOf = (row: { show_name: boolean }) =>
    petitionKind() === "public" || (includeNames && row.show_name);
  const emails = [
    ...new Set(
      rows
        .filter((r) => !showNameOf(r))
        .map((r) => String(r.email).toLowerCase()),
    ),
  ];
  if (emails.length > 0) {
    const { data: roster } = await createAdminClient()
      .from("roster")
      .select("email, role")
      .in("email", emails);
    for (const r of roster ?? []) {
      roles.set(String(r.email).toLowerCase(), r.role === "alumni" ? "alumni" : "student");
    }
  }

  return rows.map((row) => ({
    // Consent gate: on the school petition only signed viewers see names,
    // and only for consenting signers. The public petition shows every
    // name to everyone.
    name: showNameOf(row) ? row.name : undefined,
    signedAt: row.signed_at,
    role: showNameOf(row)
      ? undefined
      : (roles.get(String(row.email).toLowerCase()) ?? "staff"),
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
  return (await getMySignature(email)).signed;
}

export async function getMySignature(
  email: string,
): Promise<{ signed: boolean; showName: boolean }> {
  if (!hasDb()) {
    const row = demoSignatures.find(
      (s) => s.email === email && s.kind === petitionKind(),
    );
    return { signed: row !== undefined, showName: row?.showName ?? false };
  }
  const { data } = await createAdminClient()
    .from("signatures")
    .select("show_name")
    .eq("email", email)
    .eq("kind", petitionKind())
    .maybeSingle();
  return { signed: data !== null, showName: data?.show_name ?? false };
}

/** Flips an existing signature's name-visibility consent. */
export async function updateConsent(
  email: string,
  showName: boolean,
): Promise<boolean> {
  if (!hasDb()) {
    const row = demoSignatures.find(
      (s) => s.email === email && s.kind === petitionKind(),
    );
    if (!row) return false;
    row.showName = showName;
    return true;
  }
  const { data, error } = await createAdminClient()
    .from("signatures")
    .update({ show_name: showName })
    .eq("email", email)
    .eq("kind", petitionKind())
    .eq("show_name", false) // one-way: named rows can never revert to anonymous
    .select("id");
  if (error) throw new ApiError(500, "Could not update. Try again.");
  return (data ?? []).length > 0;
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
