import type * as React from "react";
export const dynamic = "force-dynamic";

import Link from "next/link";

import CatIcon from "@/components/CatIcon";
import GoogleSignIn from "@/components/GoogleSignIn";
import LogoutButton from "@/components/LogoutButton";
import ConsentToggle from "@/components/ConsentToggle";
import CountUp from "@/components/CountUp";
import ShareButton from "@/components/ShareButton";
import SignButton from "@/components/SignButton";
import SignatureList from "@/components/SignatureList";
import { allowedDomain, brand, petitionClosed, petitionKind } from "@/lib/env";
import {
  getMySignature,
  getPetitionContent,
  getSignatureCounts,
  listSignatures,
} from "@/lib/petition";
import { readSession } from "@/lib/session";
import { S } from "@/lib/strings";

const FIRST_PAGE = 50;

function renderBody(body: string) {
  const paras = body.split(/\n\s*\n/);
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      const items = list;
      list = [];
      blocks.push(
        <ul role="list" key={`ul-${blocks.length}`}>
          {items.map((item, j) => (
            <li role="listitem" key={j}>{item}</li>
          ))}
        </ul>,
      );
    }
  };
  paras.forEach((para, i) => {
    const trimmed = para.trim();
    if (trimmed.startsWith("\u25CF")) {
      list.push(trimmed.replace(/^\u25CF\s*/, ""));
    } else {
      flush();
      blocks.push(<p key={`p-${i}`}>{para}</p>);
    }
  });
  flush();
  return blocks;
}

export default async function Home() {
  const [session, content, counts] = await Promise.all([
    readSession(),
    getPetitionContent(),
    getSignatureCounts(),
  ]);
  const oasis = brand() === "oasis";
  const count = counts.total;
  const mine = session ? await getMySignature(session.email) : null;
  const signed = mine?.signed ?? false;
  // Signers see the names of consenting signers; everyone else gets the
  // anonymous numbered list.
  const signatures = await listSignatures(FIRST_PAGE, 0, signed);
  const pct = content.goalCount > 0 ? Math.min(100, (count / content.goalCount) * 100) : 0;

  return (
    <div className="container">
      <header className="site-header">
        <div className="row">
          <div className="brand">
            {oasis ? (
              <img src="/oasis-logo.png" alt="Oasis" className="brand-logo" />
            ) : (
              <CatIcon />
            )}
            {oasis ? "Oasis" : "Save the Cat"}
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
            {renderBody(content.body)}
          </div>

          <div className="progress">
            <div className="big-count">
              <CountUp value={count} />
              <span>人聯署</span>
            </div>
            {petitionKind() === "school" && count > 0 ? (
              <div className="count-breakdown">
                {counts.student > 0 ? <span>學生 {counts.student}</span> : null}
                {counts.alumni > 0 ? <span>校友 {counts.alumni}</span> : null}
                {counts.staff > 0 ? <span>教職員 {counts.staff}</span> : null}
              </div>
            ) : null}
            {content.goalCount > 0 ? (
              <>
                <div className="labels">
                  <span>{S.goal(content.goalCount)}</span>
                </div>
                <div className="track">
                  <div className="fill" style={{ width: `${pct}%` }} />
                </div>
              </>
            ) : null}
          </div>

          <div className="cta">
            {petitionClosed() ? (
              <div className="closed-note">
                <b>聯署已截止</b>
                <span>多謝支持——我哋已經停止收集簽名。This petition is now closed.</span>
              </div>
            ) : !session ? (
              <GoogleSignIn
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
                domain={petitionKind() === "school" ? allowedDomain() : ""}
                wrongDomain={S.wrongDomain(allowedDomain())}
              />
            ) : signed ? (
              <>
                <span className="signed-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {S.signed}
                </span>
                {petitionKind() === "school" && !oasis && mine ? (
                  <ConsentToggle
                    showName={mine.showName}
                    anonLabel={S.consentAnon}
                  />
                ) : null}
              </>
            ) : (
              <SignButton label={S.sign} askConsent={petitionKind() === "school" && !oasis} anonymous={oasis} />
            )}
            <ShareButton title={content.title} text={S.shareText} />
          </div>
        </section>

        {!oasis ? (
          <SignatureList
            initial={signatures}
            total={count}
            title={S.listTitle}
            loadMoreLabel={S.loadMore}
            roleLabels={S.roleLabels}
          />
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="row">
          <span>{S.siteName}</span>
          <span>
            {oasis ? "© 52nd Students' Association Oasis 2026" : S.copyright} · <Link href="/privacy">{S.privacyLink}</Link> ·{" "}
            <Link href="/terms">{S.termsLink}</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
