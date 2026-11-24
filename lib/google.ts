import "server-only";

import { createHash } from "node:crypto";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { allowedDomain, googleClientId } from "./env";
import { ApiError, normalizeEmail } from "./http";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdentity = {
  email: string;
  name: string;
  picture: string | null;
};

/**
 * Verifies a Google ID token (from GIS One Tap / the official button) against
 * Google's public keys, then enforces the school domain. GIS is initialized
 * with the SHA-256 of a client-generated raw nonce; the raw value is posted
 * back here so the token cannot be replayed from another origin.
 */
export async function verifyGoogleCredential(
  credential: string,
  nonce: string,
): Promise<GoogleIdentity> {
  if (!credential || !nonce) throw new ApiError(400, "Missing credential.");

  let payload;
  try {
    ({ payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: googleClientId(),
    }));
  } catch {
    throw new ApiError(401, "Google sign-in could not be verified. Try again.");
  }

  const expectedNonce = createHash("sha256").update(nonce).digest("hex");
  if (payload.nonce !== expectedNonce) {
    throw new ApiError(401, "Google sign-in could not be verified. Try again.");
  }

  if (payload.email_verified !== true) {
    throw new ApiError(403, "Your Google account has no verified email address.");
  }

  const email = normalizeEmail(typeof payload.email === "string" ? payload.email : "");
  if (!email.endsWith(`@${allowedDomain()}`)) {
    throw new ApiError(403, `Sign in with your @${allowedDomain()} school account.`);
  }

  const name =
    typeof payload.name === "string" && payload.name.trim() ? payload.name.trim() : email.split("@")[0];
  const picture =
    typeof payload.picture === "string" && payload.picture.startsWith("https://")
      ? payload.picture
      : null;

  return { email, name, picture };
}
