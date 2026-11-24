"use client";

import { useState } from "react";

export default function SignButton({
  label,
  askConsent,
}: {
  label: string;
  askConsent: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showName, setShowName] = useState(true);

  async function sign() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ showName }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Signature could not be saved. Try again.");
    } catch {
      setError("Signature could not be saved. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {askConsent ? (
        <label className="consent-check">
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
          />
          <span>
            同意喺聯署名單顯示我嘅全名（例如「陳大文」，只有已簽署嘅人先睇到）；唔剔嘅話會顯示你嘅身份
            + 編號，例如「學生 #12」
          </span>
        </label>
      ) : (
        <div className="consent-check">
          <span>簽署後你嘅名會喺聯署名單公開顯示</span>
        </div>
      )}
      <button type="button" className="btn-primary" onClick={sign} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        {busy ? "簽署中…" : label}
      </button>
      {error ? <div className="error-note">{error}</div> : null}
    </>
  );
}
