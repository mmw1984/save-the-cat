import { NextResponse } from "next/server";

import { ApiError, jsonError } from "@/lib/http";
import { signPetition } from "@/lib/petition";
import { readSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await readSession();
    if (!session) throw new ApiError(401, "Sign in first.");
    const result = await signPetition(session);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
