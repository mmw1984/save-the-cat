import { ApiError, jsonError } from "@/lib/http";
import { isAdmin, listSignaturesWithEmails } from "@/lib/petition";
import { readSession } from "@/lib/session";

function csvCell(value: string): string {
  // Spreadsheet-formula injection: a signer name starting with = + - @ would
  // evaluate when an admin opens the export. Prefix it so it stays text.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET() {
  try {
    const session = await readSession();
    if (!session || !(await isAdmin(session.email))) {
      throw new ApiError(403, "Admins only.");
    }
    const rows = await listSignaturesWithEmails(100_000, 0);
    const lines = ["name,email,signed_at"]
      .concat(rows.map((r) => [csvCell(r.name), csvCell(r.email), r.signedAt].join(",")))
      .join("\n");
    return new Response(lines, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="signatures.csv"',
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
