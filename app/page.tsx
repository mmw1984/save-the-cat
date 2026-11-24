export const dynamic = "force-dynamic";

import Link from "next/link";

import CatIcon from "@/components/CatIcon";
import GoogleSignIn from "@/components/GoogleSignIn";
import LogoutButton from "@/components/LogoutButton";
import SignButton from "@/components/SignButton";
import SignatureList from "@/components/SignatureList";
import { allowedDomain, petitionKind } from "@/lib/env";
import {
  getPetitionContent,
  getSignatureCount,
  hasSigned,
  listSignatures,
} from "@/lib/petition";
import { readSession } from "@/lib/session";
import { S } from "@/lib/strings";

const FIRST_PAGE = 50;

export default async function Home() {
  const [session, content, count] = await Promise.all([
    readSession(),
    getPetitionContent(),
    getSignatureCount(),
  ]);
  const signed = session ? await hasSigned(session.email) : false;
  // Signers see the names of consenting signers; everyone else gets the
  // anonymous numbered list.
  const signatures = await listSignatures(FIRST_PAGE, 0, signed);
  const pct = content.goalCount > 0 ? Math.min(100, (count / content.goalCount) * 100) : 0;

  return (
    <div className="container">
      <header className="site-header">
        <div className="row">
          <div className="brand">
            <CatIcon />
            Save the Cat
          </div>
          {session ? (
            <div className="account">
              {session.picture ? <img src={session.picture} alt="" referrerPolicy="no-referrer" /> : null}
              <span>{session.email}</span>
              <LogoutButton label={S.signOut} />
            </div>
          ) : null}
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>{content.title}</h1>
          <div className="body">
            {content.body.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="progress">
            <div className="labels">
              <span>
                {S.signedCountPrefix}
                <b>{count.toLocaleString()}</b>
                {S.signedCountSuffix}
              </span>
              {content.goalCount > 0 ? <span>{S.goal(content.goalCount)}</span> : null}
            </div>
            {content.goalCount > 0 ? (
              <div className="track">
                <div className="fill" style={{ width: `${pct}%` }} />
              </div>
            ) : null}
          </div>

          <div className="cta">
            {!session ? (
              <GoogleSignIn
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
                domain={petitionKind() === "school" ? allowedDomain() : ""}
                wrongDomain={S.wrongDomain(allowedDomain())}
              />
            ) : signed ? (
              <span className="signed-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                {S.signed}
              </span>
            ) : (
              <SignButton label={S.sign} askConsent={petitionKind() === "school"} />
            )}
          </div>
        </section>

        <SignatureList
          initial={signatures}
          total={count}
          title={S.listTitle}
          loadMoreLabel={S.loadMore}
          roleLabels={S.roleLabels}
        />
      </main>

      <footer className="site-footer">
        <div className="row">
          <span>{S.siteName}</span>
          <span>
            {S.copyright} · <Link href="/privacy">{S.privacyLink}</Link> ·{" "}
            <Link href="/terms">{S.termsLink}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
