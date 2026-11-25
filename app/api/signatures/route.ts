import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { getSignatureCount, hasSigned, listSignatures } from "@/lib/petition";
import { readSession } from "@/lib/session";

const PAGE = 50;

/** Public signature feed: sign times only — names and emails stay server-side. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
    // Names are included only for viewers who have already signed, and only
    // for signers who opted in via show_name.
    const session = await readSession();
    const canSeeNames = session ? await hasSigned(session.email) : false;
    const [signatures, total] = await Promise.all([
      listSignatures(PAGE, offset, canSeeNames),
      getSignatureCount(),
    ]);
    return NextResponse.json({ signatures, total });
  } catch (error) {
    return jsonError(error);
  }
}
