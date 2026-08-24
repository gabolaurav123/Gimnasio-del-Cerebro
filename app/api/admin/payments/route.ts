import { z } from "zod";
import { createPayment, getPayments } from "../../../../db/repository";
import { getRequestAdmin } from "../../../../lib/auth";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const paymentSchema = z.object({
  payerName: z.string().trim().min(2).max(150),
  payerEmail: z.union([z.literal(""), z.email().max(200)]).optional().default(""),
  payerPhone: optionalText(40),
  concept: z.string().trim().min(2).max(180),
  itemType: z.enum(["PRODUCT", "TRAINING", "EVENT", "OTHER"]),
  itemId: optionalText(120),
  amount: z.coerce.number().positive().max(100000000),
  currency: z.enum(["BOB", "USD", "EUR"]),
  paymentMethod: z.enum(["BANK_TRANSFER", "QR", "CASH", "CARD", "OTHER"]),
  providerReference: optionalText(180),
  paidAt: optionalText(40),
  notes: optionalText(1500),
});

export async function GET(request: Request) {
  if (!(await getRequestAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const url = new URL(request.url);
  return Response.json({ payments: await getPayments(url.searchParams.get("q") || "", url.searchParams.get("status") || "") });
}

export async function POST(request: Request) {
  if (!(await getRequestAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = paymentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa los datos del pago." }, { status: 400 });
  const data = parsed.data;
  const result = await createPayment({
    payerName: data.payerName, payerEmail: data.payerEmail || null, payerPhone: data.payerPhone || null,
    concept: data.concept, itemType: data.itemType, itemId: data.itemId || null,
    amountCents: Math.round(data.amount * 100), currency: data.currency, paymentMethod: data.paymentMethod,
    providerReference: data.providerReference || null, paidAt: data.paidAt || null, notes: data.notes || null,
  });
  return Response.json(result, { status: 201 });
}
