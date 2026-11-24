import { NextResponse } from "next/server";

import { verifyGoogleCredential } from "@/lib/google";
import { jsonError } from "@/lib/http";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";

/** GIS (One Tap / official button) posts its credential here; we verify it and
 *  set the session cookie. No Google client secret is needed. */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      credential?: string;
      nonce?: string;
    };
    const identity = await verifyGoogleCredential(body.credential ?? "", body.nonce ?? "");

    const token = await createSessionToken(identity);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
