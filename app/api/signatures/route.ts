import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { getSignatureCount, listSignatures } from "@/lib/petition";

const PAGE = 50;

/** Public signature feed: names + sign times only, never emails. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
    const [signatures, total] = await Promise.all([
      listSignatures(PAGE, offset),
      getSignatureCount(),
    ]);
    return NextResponse.json({ signatures, total });
  } catch (error) {
    return jsonError(error);
  }
}
