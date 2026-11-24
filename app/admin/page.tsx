export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import CatIcon from "@/components/CatIcon";
import { isAdmin, listSignaturesWithEmails } from "@/lib/petition";
import { readSession } from "@/lib/session";
import { S } from "@/lib/strings";

const timeFmt = new Intl.DateTimeFormat("zh-HK", {
  timeZone: "Asia/Hong_Kong",
  dateStyle: "short",
  timeStyle: "short",
  hour12: false,
});

const PAGE_SIZE = 500;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await readSession();
  if (!session || !(await isAdmin(session.email))) redirect("/");

  const page = Math.max(1, Number((await searchParams).page ?? 1) || 1);
  const rows = await listSignaturesWithEmails(PAGE_SIZE, (page - 1) * PAGE_SIZE);

  return (
    <div className="container">
      <header className="site-header">
        <div className="row">
          <div className="brand">
            <CatIcon />
            {S.adminTitle}
          </div>
          <div className="account">
            <a href="/api/admin/export" download>
              {S.exportCsv}
            </a>
            <Link href="/">← {S.siteName}</Link>
          </div>
        </div>
      </header>
      <main style={{ padding: "24px 0 48px" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>{S.colName}</th>
              <th>{S.colEmail}</th>
              <th>{S.colTime}</th>
              <th>{S.colKind}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{timeFmt.format(new Date(r.signedAt))}</td>
                <td>{r.kind === "public" ? "公眾" : "學生"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="account" style={{ marginTop: 16 }}>
          {page > 1 && <Link href={`/admin?page=${page - 1}`}>← {S.prevPage}</Link>}
          <span style={{ color: "var(--muted)" }}>
            {S.page} {page}
          </span>
          {rows.length === PAGE_SIZE && (
            <Link href={`/admin?page=${page + 1}`}>{S.nextPage} →</Link>
          )}
        </div>
      </main>
    </div>
  );
}
