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

export default async function AdminPage() {
  const session = await readSession();
  if (!session || !(await isAdmin(session.email))) redirect("/");

  const rows = await listSignaturesWithEmails(500, 0);

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
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{timeFmt.format(new Date(r.signedAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
