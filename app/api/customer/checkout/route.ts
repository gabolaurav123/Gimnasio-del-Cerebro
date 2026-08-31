import { z } from "zod";
import { getCustomerById } from "../../../../db/customer-repository";
import { createPayment, getDatabase } from "../../../../db/repository";
import { getRequestCustomer } from "../../../../lib/customer-auth";
import { checkRateLimit, rateLimitKey } from "../../../../lib/rate-limit";

const schema = z.object({ itemType: z.enum(["PRODUCT", "TRAINING"]), itemId: z.string().min(1).max(100) });
const limit = { max: 10, windowMs: 60 * 60 * 1000, blockMs: 15 * 60 * 1000 };
export async function POST(request: Request) {
  const session = await getRequestCustomer(request);
  if (!session) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const allowed = checkRateLimit(rateLimitKey(request, "customer-checkout", session.customerId), limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Producto inválido." }, { status: 400 });
  const db = await getDatabase();
  const table = parsed.data.itemType === "PRODUCT" ? "products" : "trainings";
  const row = await db.prepare(`SELECT id, name, checkout_provider, checkout_url, price_cents, currency FROM ${table} WHERE id = ? AND status = 'PUBLISHED' LIMIT 1`).bind(parsed.data.itemId).first<{ id: string; name: string; checkout_provider: string; checkout_url: string | null; price_cents: number; currency: string }>();
  if (!row || !["STRIPE", "HOTMART"].includes(row.checkout_provider) || !row.checkout_url || Number(row.price_cents) <= 0) return Response.json({ error: "El método de pago todavía no está disponible." }, { status: 409 });
  const customer = await getCustomerById(session.customerId);
  if (!customer) return Response.json({ error: "Cuenta no encontrada." }, { status: 401 });
  const recent = await db.prepare(`SELECT id FROM payments WHERE customer_id = ? AND item_type = ? AND item_id = ? AND status = 'PENDING' AND created_at >= ? LIMIT 1`).bind(customer.id, parsed.data.itemType, row.id, new Date(Date.now() - 30 * 60 * 1000).toISOString()).first<{ id: string }>();
  if (!recent) await createPayment({ payerName: customer.name, payerEmail: customer.email, payerPhone: customer.phone, customerId: customer.id, concept: row.name, itemType: parsed.data.itemType, itemId: row.id, amountCents: Number(row.price_cents), currency: row.currency, paymentMethod: "CARD", providerReference: null, paidAt: null, notes: `Pago iniciado desde la cuenta del usuario mediante ${row.checkout_provider}.`, source: row.checkout_provider });
  return Response.json({ url: row.checkout_url }, { headers: { "cache-control": "no-store" } });
}
