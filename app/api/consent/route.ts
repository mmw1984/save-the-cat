import { updateConsent } from "@/lib/petition";
import { readSession } from "@/lib/session";

/** POST {showName: true} — upgrades an anonymous signature to named. One-way. */
export async function POST(req: Request) {
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }
  let showName = false;
  try {
    const body = (await req.json()) as { showName?: boolean };
    showName = body.showName === true;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!showName) {
    return Response.json(
      { error: "Named signatures cannot go back to anonymous." },
      { status: 400 },
    );
  }
  const updated = await updateConsent(session.email, true);
  if (!updated) {
    return Response.json({ error: "No signature found." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
