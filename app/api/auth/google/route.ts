import { NextResponse } from "next/server";

import { isBlacklisted } from "@/lib/blacklist";
import { verifyGoogleCredential } from "@/lib/google";
import { ApiError, jsonError } from "@/lib/http";
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

    if (await isBlacklisted(identity.email)) {
      throw new ApiError(403, "呢個帳號已被禁止登入。This account is not allowed to sign in.");
    }

    const token = await createSessionToken(identity);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
