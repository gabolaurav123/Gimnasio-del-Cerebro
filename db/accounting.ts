import { getDatabase } from "./repository";

export type AccountingEntry = {
  id: string; paymentId: string | null; entryType: "INCOME" | "FEE" | "TAX" | "REFUND" | "EXPENSE" | "ADJUSTMENT";
  category: string; itemType: string; itemId: string | null; itemName: string; description: string;
  amountCents: number; currency: string; occurredAt: string; createdBy: string | null;
};

function mapEntry(row: Record<string, unknown>): AccountingEntry {
  return {
    id: String(row.id), paymentId: row.payment_id ? String(row.payment_id) : null, entryType: String(row.entry_type) as AccountingEntry["entryType"],
    category: String(row.category), itemType: String(row.item_type), itemId: row.item_id ? String(row.item_id) : null,
    itemName: String(row.item_name || "General"), description: String(row.description), amountCents: Number(row.amount_cents),
    currency: String(row.currency), occurredAt: String(row.occurred_at), createdBy: row.created_by ? String(row.created_by) : null,
  };
}

export async function getAccountingEntries(query = "") {
  const db = await getDatabase();
  const value = `%${query}%`;
  const where = query ? `WHERE a.description LIKE ? OR a.category LIKE ? OR a.currency LIKE ?` : "";
  const result = await db.prepare(`SELECT a.*, CASE WHEN a.item_type = 'PRODUCT' THEN p.name WHEN a.item_type = 'TRAINING' THEN t.name WHEN a.item_type = 'EVENT' THEN e.title ELSE 'General' END AS item_name FROM accounting_entries a LEFT JOIN products p ON a.item_type = 'PRODUCT' AND a.item_id = p.id LEFT JOIN trainings t ON a.item_type = 'TRAINING' AND a.item_id = t.id LEFT JOIN events e ON a.item_type = 'EVENT' AND a.item_id = e.id ${where} ORDER BY a.occurred_at DESC, a.created_at DESC LIMIT 1000`)
    .bind(...(query ? [value, value, value] : [])).all<Record<string, unknown>>();
  return result.results.map(mapEntry);
}

export async function createAccountingEntry(input: Omit<AccountingEntry, "id" | "paymentId" | "itemName">) {
  const db = await getDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO accounting_entries (id, entry_type, category, item_type, item_id, description, amount_cents, currency, occurred_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, input.entryType, input.category, input.itemType, input.itemId, input.description, input.amountCents, input.currency, input.occurredAt, input.createdBy).run();
  return id;
}

export async function getAccountingSummary() {
  const db = await getDatabase();
  const [currency, items] = await Promise.all([
    db.prepare(`SELECT currency, COALESCE(SUM(CASE WHEN entry_type = 'INCOME' THEN amount_cents ELSE 0 END), 0) AS income, COALESCE(SUM(CASE WHEN entry_type IN ('FEE','TAX','EXPENSE') THEN ABS(amount_cents) ELSE 0 END), 0) AS outflow, COALESCE(SUM(CASE WHEN entry_type = 'REFUND' THEN ABS(amount_cents) ELSE 0 END), 0) AS refunds, COALESCE(SUM(amount_cents), 0) AS net FROM accounting_entries GROUP BY currency ORDER BY currency`).all<{ currency: string; income: number; outflow: number; refunds: number; net: number }>(),
    db.prepare(`SELECT a.currency, a.item_type, a.item_id, CASE WHEN a.item_type = 'PRODUCT' THEN p.name WHEN a.item_type = 'TRAINING' THEN t.name WHEN a.item_type = 'EVENT' THEN e.title ELSE 'General' END AS item_name, COALESCE(SUM(a.amount_cents), 0) AS net FROM accounting_entries a LEFT JOIN products p ON a.item_type = 'PRODUCT' AND a.item_id = p.id LEFT JOIN trainings t ON a.item_type = 'TRAINING' AND a.item_id = t.id LEFT JOIN events e ON a.item_type = 'EVENT' AND a.item_id = e.id GROUP BY a.currency, a.item_type, a.item_id, item_name ORDER BY a.currency, net DESC`).all<{ currency: string; item_type: string; item_id: string | null; item_name: string; net: number }>(),
  ]);
  return { currency: currency.results.map((row) => ({ ...row, income: Number(row.income), outflow: Number(row.outflow), refunds: Number(row.refunds), net: Number(row.net) })), items: items.results.map((row) => ({ currency: row.currency, itemType: row.item_type, itemId: row.item_id, itemName: row.item_name, net: Number(row.net) })) };
}

function xml(value: unknown) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function row(cells: Array<string | number>) { return `<Row>${cells.map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${xml(cell)}</Data></Cell>`).join("")}</Row>`; }

export function accountingWorkbook(entries: AccountingEntry[], summary: Awaited<ReturnType<typeof getAccountingSummary>>) {
  const detailRows = [row(["Fecha", "Tipo", "Categoría", "Producto / programa", "Descripción", "Importe", "Moneda", "Pago", "Registrado por"]), ...entries.map((entry) => row([entry.occurredAt, entry.entryType, entry.category, entry.itemName, entry.description, entry.amountCents / 100, entry.currency, entry.paymentId || "", entry.createdBy || "Sistema"]))].join("");
  const summaryRows = [row(["Moneda", "Ingresos", "Comisiones/impuestos/gastos", "Reembolsos", "Neto"]), ...summary.currency.map((item) => row([item.currency, item.income / 100, item.outflow / 100, item.refunds / 100, item.net / 100]))].join("");
  const productRows = [row(["Moneda", "Tipo", "Producto / programa", "Neto"]), ...summary.items.map((item) => row([item.currency, item.itemType, item.itemName, item.net / 100]))].join("");
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Movimientos"><Table>${detailRows}</Table></Worksheet><Worksheet ss:Name="Resumen por moneda"><Table>${summaryRows}</Table></Worksheet><Worksheet ss:Name="Por producto"><Table>${productRows}</Table></Worksheet></Workbook>`;
}
