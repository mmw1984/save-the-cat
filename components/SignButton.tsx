"use client";

import { useState } from "react";

import { shareStoryCard } from "@/lib/share-story";

export default function SignButton({
  label,
  askConsent,
  anonymous = false,
}: {
  label: string;
  askConsent: boolean;
  anonymous?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showName, setShowName] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [signed, setSigned] = useState(false);

  async function sign() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ showName: anonymous ? false : showName }),
      });
      if (res.ok) {
        if (anonymous) {
          setSigned(true);
        } else {
          window.location.reload();
        }
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
      {anonymous ? (
        <div className="consent-check">
          <span>你嘅簽署會以匿名方式記錄，姓名唔會喺名單顯示</span>
        </div>
      ) : askConsent ? (
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
      <button
        type="button"
        className="btn-primary"
        onClick={() => (anonymous ? setConfirming(true) : sign())}
        disabled={busy}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
        {busy ? "簽署中…" : label}
      </button>
      {error ? <div className="error-note">{error}</div> : null}

      {anonymous && confirming ? (
        <div className="popup-backdrop" role="dialog" aria-modal="true">
          <div className="popup-dialog">
            <div className="popup-title">確認聯署？</div>
            <p className="popup-body">
              你嘅簽署會以<strong>匿名</strong>方式記錄，姓名唔會喺名單顯示。確認後唔可以撤回。
            </p>
            <div className="popup-actions">
              <button type="button" className="popup-ghost" onClick={() => setConfirming(false)}>
                取消
              </button>
              <button
                type="button"
                className="popup-primary"
                disabled={busy}
                onClick={() => {
                  setConfirming(false);
                  sign();
                }}
              >
                {busy ? "簽署中…" : "確認聯署"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {anonymous && signed ? (
        <div className="popup-backdrop" role="dialog" aria-modal="true">
          <div className="popup-dialog">
            <div className="popup-title">多謝你嘅聯署！</div>
            <p className="popup-body">幫手 share 出去，等更多人睇到：</p>
            <ol className="popup-steps">
              <li>撳下面「即刻分享」</li>
              <li>喺分享清單揀 Instagram</li>
              <li>張圖會直接入你嘅 story 草稿，加個 link sticker 貼返 petition.oasishwc.qzz.io 就完美</li>
            </ol>
            <div className="popup-actions">
              <button type="button" className="popup-ghost" onClick={() => window.location.reload()}>
                好！
              </button>
              <button
                type="button"
                className="popup-primary"
                onClick={() => {
                  shareStoryCard("Save the Cat 聯署").catch(() => {});
                }}
              >
                即刻分享
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
