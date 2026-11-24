"use client";

import { useState } from "react";

type Signature = { name?: string; signedAt: string };

const timeFmt = new Intl.DateTimeFormat("zh-HK", {
  timeZone: "Asia/Hong_Kong",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : timeFmt.format(d).replace(/\//g, "-");
}

export default function SignatureList({
  initial,
  total,
  title,
  loadMoreLabel,
}: {
  initial: Signature[];
  total: number;
  title: string;
  loadMoreLabel: string;
}) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);

  const hasMore = rows.length < total;

  async function loadMore() {
    setBusy(true);
    try {
      const res = await fetch(`/api/signatures?offset=${rows.length}`);
      if (res.ok) {
        const data = (await res.json()) as { signatures: Signature[] };
        setRows((prev) => [...prev, ...data.signatures]);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sig-list">
      <div className="head">
        {title}
      </div>
      {rows.map((s, i) => (
        <div className="sig-row" key={`${s.signedAt}-${i}`}>
          <span className="name">{s.name ?? `聯署 #${total - i}`}</span>
          <span className="time">{formatTime(s.signedAt)}</span>
        </div>
      ))}
      {rows.length === 0 ? (
        <div className="sig-row">
          <span className="time">仲未有簽名 — 做第一個！</span>
        </div>
      ) : null}
      {hasMore ? (
        <button type="button" className="more" onClick={loadMore} disabled={busy}>
          {busy ? "…" : `${loadMoreLabel}（${rows.length}/${total}）`}
        </button>
      ) : null}
    </div>
  );
}
