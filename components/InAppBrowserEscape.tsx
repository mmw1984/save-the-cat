"use client";

import { useEffect, useState } from "react";

import {
  needsManualEscape,
  needsUserGesture,
  useEscapeUrl,
  useIsInAppBrowser,
} from "eiab/react";

/**
 * Forces visitors in in-app browsers (Threads, Instagram, Facebook, ...)
 * out to the system browser: Google sign-in does not work inside webviews.
 * Android escapes auto-navigate; Meta iOS blocks auto-redirects, so those
 * users get a blocking dialog whose only way forward is the open/copy action.
 */
export default function InAppBrowserEscape({
  children,
}: {
  children: React.ReactNode;
}) {
  const isInApp = useIsInAppBrowser();
  const escapeUrl = useEscapeUrl();
  const [copied, setCopied] = useState(false);

  const [handoffFailed, setHandoffFailed] = useState(false);

  useEffect(() => {
    if (isInApp !== true) return;
    // Platforms that don't need a user gesture (Android webviews) escape
    // straight away — no dialog, no choice. If the webview silently drops
    // the handoff, fall back to the same blocking sheet after a delay.
    if (!needsUserGesture() && escapeUrl) {
      window.location.href = escapeUrl;
      const timer = setTimeout(() => {
        if (document.visibilityState === "visible") {
          setHandoffFailed(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInApp, escapeUrl]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("複製個 link：", window.location.href);
    }
  }

  const manualOnly = isInApp === true && needsManualEscape();

  return (
    <>
      {children}
      {isInApp === true && (needsUserGesture() || handoffFailed) ? (
        <div className="escape-backdrop">
          <div className="escape-dialog">
            <div className="escape-title">請喺瀏覽器開啟</div>
            <div className="escape-desc">
              Google 登入喺 in-app browser 用唔到——一定要喺系統瀏覽器（Safari /
              Chrome）開返呢一頁先簽到名。
            </div>
            {!manualOnly && escapeUrl ? (
              <a className="escape-open" href={escapeUrl}>
                喺瀏覽器開啟
              </a>
            ) : null}
            <button type="button" className="escape-copy" onClick={copy}>
              {copied ? "已複製！" : "複製連結"}
            </button>
            {manualOnly ? (
              <div className="escape-hint">
                複製之後貼去 Safari / Chrome 開啟
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
