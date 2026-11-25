import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { isBlacklisted } from "./blacklist";
import { sessionSecret } from "./env";

export const SESSION_COOKIE = "stc_session";
const SESSION_DAYS = 30;

export type Session = {
  email: string;
  name: string;
  picture: string | null;
};

function key(): Uint8Array {
  return new TextEncoder().encode(sessionSecret());
}

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ name: session.name, picture: session.picture })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const email = payload.sub;
    if (!email) return null;
    // Blacklisting takes effect immediately, even for sessions issued earlier.
    if (await isBlacklisted(email)) return null;
    return {
      email,
      name: typeof payload.name === "string" ? payload.name : email,
      picture: typeof payload.picture === "string" ? payload.picture : null,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  path: "/",
};
