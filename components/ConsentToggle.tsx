"use client";

import { useState } from "react";

/** Lets an anonymous signer upgrade to named after signing (one-way). */
export default function ConsentToggle({
  showName,
  anonLabel,
}: {
  showName: boolean;
  anonLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flip() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ showName: true }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError("更新唔到，請再試。");
    } catch {
      setError("更新唔到，請再試。");
    } finally {
      setBusy(false);
    }
  }

  // One-way only: anonymous may upgrade to named; named cannot go back.
  if (showName) return null;

  return (
    <div className="consent-toggle">
      {anonLabel}{" "}
      <button type="button" className="link-btn" onClick={flip} disabled={busy}>
        改為公開全名
      </button>
      {error ? <div className="error-note">{error}</div> : null}
    </div>
  );
}
