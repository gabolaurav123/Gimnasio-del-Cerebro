import { z } from "zod";
import { setCustomerEntitlement } from "../../../../../../db/customer-repository";
import { getDatabase } from "../../../../../../db/repository";
import { requestIsAdmin } from "../../../../../../lib/auth";

const schema = z.object({ itemType: z.enum(["PRODUCT", "TRAINING"]), itemId: z.string().min(1).max(100), active: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Acceso inválido." }, { status: 400 });
  const customerId = (await context.params).id;
  const db = await getDatabase();
  const customer = await db.prepare(`SELECT id FROM customer_users WHERE id = ? LIMIT 1`).bind(customerId).first<{ id: string }>();
  if (!customer) return Response.json({ error: "Usuario no encontrado." }, { status: 404 });
  const table = parsed.data.itemType === "PRODUCT" ? "products" : "trainings";
  const item = await db.prepare(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`).bind(parsed.data.itemId).first<{ id: string }>();
  if (!item) return Response.json({ error: "Contenido no encontrado." }, { status: 404 });
  const entitlementId = await setCustomerEntitlement({ customerId, ...parsed.data });
  return Response.json({ ok: true, entitlementId });
}
