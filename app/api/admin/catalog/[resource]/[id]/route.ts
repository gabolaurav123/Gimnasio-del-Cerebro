import { z } from "zod";
import { requestIsAdmin } from "../../../../../../lib/auth";
import { setCatalogStatus, updateAssociate, updateEvent, updateProduct } from "../../../../../../db/repository";

const asset = z.string().trim().max(500).refine((value) => !value || /^\/(?:api\/media\/[a-z0-9-]+|logos\/[a-z0-9._/-]+|images\/[a-z0-9._/-]+)$/i.test(value));
const externalUrl = z.string().trim().max(500).refine((value) => !value || /^https:\/\//i.test(value));
const base = { image: asset.optional().default(""), displayOrder: z.coerce.number().int().min(0).max(999) };
const productSchema = z.object({ ...base, name: z.string().trim().min(2).max(150), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().trim().min(10).max(3000), priceLabel: z.string().trim().min(1).max(80), discountLabel: z.string().trim().max(120).optional().default("") });
const eventSchema = z.object({ ...base, title: z.string().trim().min(3).max(150), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().trim().min(10).max(3000), startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/), location: z.string().trim().min(2).max(180), registrationUrl: externalUrl.optional().default("") });
const associateSchema = z.object({ ...base, name: z.string().trim().min(2).max(150), url: externalUrl.refine(Boolean), description: z.string().trim().min(10).max(3000) });
const statusSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]) });

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { resource, id } = await context.params;
  if (!(["products", "events", "associates"] as const).includes(resource as "products" | "events" | "associates")) return Response.json({ error: "Recurso no encontrado" }, { status: 404 });
  const body = await request.json().catch(() => null);
  const status = statusSchema.safeParse(body);
  if (status.success) { await setCatalogStatus(resource as "products" | "events" | "associates", id, status.data.status); return Response.json({ ok: true }); }
  if (resource === "products") {
    const parsed = productSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del producto." }, { status: 400 });
    await updateProduct(id, { ...parsed.data, image: parsed.data.image || null, discountLabel: parsed.data.discountLabel || null });
  } else if (resource === "events") {
    const parsed = eventSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del evento." }, { status: 400 });
    await updateEvent(id, { ...parsed.data, image: parsed.data.image || null, registrationUrl: parsed.data.registrationUrl || null });
  } else {
    const parsed = associateSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del asociado." }, { status: 400 });
    await updateAssociate(id, { ...parsed.data, image: parsed.data.image || null });
  }
  return Response.json({ ok: true });
}
