import { accountingWorkbook, getAccountingEntries, getAccountingSummary } from "../../../../../db/accounting";
import { getRequestAdmin } from "../../../../../lib/auth";

export async function GET(request: Request) {
  if (!(await getRequestAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const [entries, summary] = await Promise.all([getAccountingEntries(), getAccountingSummary()]);
  const workbook = accountingWorkbook(entries, summary);
  return new Response(workbook, { headers: { "content-type": "application/vnd.ms-excel; charset=utf-8", "content-disposition": `attachment; filename="gdc-contabilidad-${new Date().toISOString().slice(0, 10)}.xls"`, "cache-control": "no-store" } });
}
