"use client";

import { useState } from "react";

/** Share row: dedicated IG Story deep-link + generic native share/copy fallback. */
export default function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink(): Promise<string> {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard unavailable — IG story still opens, user can type the link
    }
    return url;
  }

  async function shareIgStory() {
    await copyLink();
    // instagram://story-camera opens the story composer with no Facebook
    // App ID needed (instagram-stories://share requires one). The copied
    // link can then be pasted in as a link sticker.
    window.location.href = "instagram://story-camera";
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function share() {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user dismissed the sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("複製個 link：", url);
    }
  }

  return (
    <div className="share-row">
      <button type="button" className="btn-secondary btn-ig" onClick={shareIgStory}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.2 15.58 2.2 15.2 2.2 12s0-3.58.08-4.85C2.42 3.92 3.94 2.38 7.2 2.27 8.4 2.21 8.8 2.2 12 2.2zm0 1.62c-3.15 0-3.53.01-4.77.07-2.66.12-3.74 1.38-3.86 3.86-.05 1.24-.07 1.62-.07 4.77s.01 3.53.07 4.77c.12 2.48 1.2 3.74 3.86 3.86 1.24.05 1.62.07 4.77.07s3.53-.01 4.77-.07c2.66-.12 3.74-1.38 3.86-3.86.05-1.24.07-1.62.07-4.77s-.01-3.53-.07-4.77c-.12-2.48-1.2-3.74-3.86-3.86-1.24-.05-1.62-.07-4.77-.07zm0 2.62a5.56 5.56 0 1 1 0 11.12 5.56 5.56 0 0 1 0-11.12zm0 9.17a3.61 3.61 0 1 0 0-7.22 3.61 3.61 0 0 0 0 7.22zm5.78-9.32a1.3 1.3 0 1 1-2.6 0 1.3 1.3 0 0 1 2.6 0z" />
        </svg>
        IG Story
      </button>
      <button type="button" className="btn-secondary" onClick={share}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
        </svg>
        {copied ? "已複製 link" : "分享"}
      </button>
    </div>
  );
}
