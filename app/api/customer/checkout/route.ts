import { z } from "zod";
import { getCustomerById } from "../../../../db/customer-repository";
import { createPayment, getDatabase } from "../../../../db/repository";
import { getRequestAdmin } from "../../../../lib/auth";
import { getRequestCustomer } from "../../../../lib/customer-auth";
import { buildCheckoutDestination } from "../../../../lib/payment-automation";
import { checkRateLimit, rateLimitKey } from "../../../../lib/rate-limit";

const schema = z.object({ itemType: z.enum(["PRODUCT", "TRAINING"]), itemId: z.string().min(1).max(100) });
const limit = { max: 10, windowMs: 60 * 60 * 1000, blockMs: 15 * 60 * 1000 };
export async function POST(request: Request) {
  const [session, admin] = await Promise.all([getRequestCustomer(request), getRequestAdmin(request)]);
  if (!session && !admin) return Response.json({ error: "Inicia sesión o crea una cuenta para continuar." }, { status: 401 });
  const allowed = checkRateLimit(rateLimitKey(request, "customer-checkout", session?.customerId || admin?.userId || "unknown"), limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Producto inválido." }, { status: 400 });
  const db = await getDatabase();
  const table = parsed.data.itemType === "PRODUCT" ? "products" : "trainings";
  const row = await db.prepare(`SELECT id, name, checkout_provider, checkout_url, price_cents, currency FROM ${table} WHERE id = ? AND status = 'PUBLISHED' AND deleted_at IS NULL LIMIT 1`).bind(parsed.data.itemId).first<{ id: string; name: string; checkout_provider: string; checkout_url: string | null; price_cents: number; currency: string }>();
  if (!row || !["STRIPE", "HOTMART"].includes(row.checkout_provider) || !row.checkout_url) return Response.json({ error: "El método de pago todavía no está disponible." }, { status: 409 });
  const customer = session ? await getCustomerById(session.customerId) : null;
  if (session && !customer) return Response.json({ error: "Cuenta no encontrada." }, { status: 401 });
  const payer = customer
    ? { name: customer.name, email: customer.email, phone: customer.phone, customerId: customer.id }
    : { name: "Administrador", email: admin!.email, phone: null, customerId: null };
  const payment = await createPayment({
    payerName: payer.name,
    payerEmail: payer.email,
    payerPhone: payer.phone,
    customerId: payer.customerId,
    concept: row.name,
    itemType: parsed.data.itemType,
    itemId: row.id,
    amountCents: Number(row.price_cents),
    currency: row.currency,
    paymentMethod: "CARD",
    providerReference: null,
    paidAt: null,
    notes: `Intento de pago iniciado mediante ${row.checkout_provider}. La confirmación y el acceso dependen del webhook firmado del proveedor.`,
    source: row.checkout_provider,
  });
  const url = await buildCheckoutDestination({
    provider: row.checkout_provider as "STRIPE" | "HOTMART",
    checkoutUrl: row.checkout_url,
    paymentId: payment.id,
    payerEmail: payer.email,
    itemName: row.name,
    amountCents: Number(row.price_cents),
    currency: row.currency,
  });
  return Response.json({ url, paymentId: payment.id }, { headers: { "cache-control": "no-store" } });
}
