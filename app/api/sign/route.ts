import { NextResponse } from "next/server";

import { ApiError, jsonError } from "@/lib/http";
import { petitionClosed } from "@/lib/env";
import { signPetition } from "@/lib/petition";
import { readSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    if (petitionClosed()) throw new ApiError(403, "聯署已經截止，多謝支持。This petition is now closed.");
    const session = await readSession();
    if (!session) throw new ApiError(401, "Sign in first.");
    const body = (await request.json().catch(() => ({}))) as { showName?: boolean };
    const result = await signPetition(session, body.showName === true);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
