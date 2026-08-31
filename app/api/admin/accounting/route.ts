import { z } from "zod";
import { createAccountingEntry } from "../../../../db/accounting";
import { getRequestAdmin } from "../../../../lib/auth";

const schema = z.object({ entryType: z.enum(["INCOME", "FEE", "TAX", "REFUND", "EXPENSE", "ADJUSTMENT"]), category: z.string().trim().min(2).max(100), itemType: z.enum(["PRODUCT", "TRAINING", "EVENT", "GENERAL"]), itemId: z.string().max(100).nullable(), description: z.string().trim().min(3).max(500), amount: z.coerce.number().positive().max(10_000_000), currency: z.enum(["BOB", "USD", "EUR"]), occurredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export async function POST(request: Request) {
  const admin = await getRequestAdmin(request, ["SUPERADMIN"]);
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa los datos del movimiento." }, { status: 400 });
  const negative = ["FEE", "TAX", "REFUND", "EXPENSE"].includes(parsed.data.entryType);
  return Response.json({ id: await createAccountingEntry({ ...parsed.data, amountCents: Math.round(parsed.data.amount * 100) * (negative ? -1 : 1), occurredAt: `${parsed.data.occurredAt}T12:00:00-04:00`, createdBy: admin.email }) }, { status: 201 });
}
