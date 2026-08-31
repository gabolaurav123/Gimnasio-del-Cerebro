import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { createAssociate, createEvent, createProduct } from "../../../../../db/repository";

const asset = z.string().trim().max(500).refine((value) => !value || /^\/(?:api\/media\/[a-z0-9-]+|logos\/[a-z0-9._/-]+|images\/[a-z0-9._/-]+)$/i.test(value), "Archivo inválido");
const externalUrl = z.string().trim().max(500).refine((value) => !value || /^https:\/\//i.test(value), "Usa una URL segura https://");
const base = { image: asset.optional().default(""), displayOrder: z.coerce.number().int().min(0).max(999) };
const productSchema = z.object({ ...base, name: z.string().trim().min(2).max(150), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().trim().min(10).max(3000), priceLabel: z.string().trim().min(1).max(80), discountLabel: z.string().trim().max(120).optional().default(""), dashboardContent: z.string().trim().max(10000).optional().default(""), resourceUrl: externalUrl.optional().default(""), checkoutProvider: z.enum(["STRIPE", "HOTMART", "MANUAL"]).default("MANUAL"), checkoutUrl: externalUrl.optional().default(""), priceCents: z.coerce.number().int().min(0).max(1_000_000_000), currency: z.enum(["BOB", "USD", "EUR"]) });
const eventSchema = z.object({ ...base, title: z.string().trim().min(3).max(150), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().trim().min(10).max(3000), startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/), location: z.string().trim().min(2).max(180), registrationUrl: externalUrl.optional().default("") });
const associateSchema = z.object({ ...base, name: z.string().trim().min(2).max(150), url: externalUrl.refine(Boolean), description: z.string().trim().min(10).max(3000) });

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { resource } = await context.params;
  const body = await request.json().catch(() => null);
  if (resource === "products") {
    const parsed = productSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del producto." }, { status: 400 });
    return Response.json({ id: await createProduct({ ...parsed.data, image: parsed.data.image || null, discountLabel: parsed.data.discountLabel || null, dashboardContent: parsed.data.dashboardContent || null, resourceUrl: parsed.data.resourceUrl || null, checkoutUrl: parsed.data.checkoutUrl || null }) }, { status: 201 });
  }
  if (resource === "events") {
    const parsed = eventSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del evento." }, { status: 400 });
    return Response.json({ id: await createEvent({ ...parsed.data, image: parsed.data.image || null, registrationUrl: parsed.data.registrationUrl || null }) }, { status: 201 });
  }
  if (resource === "associates") {
    const parsed = associateSchema.safeParse(body); if (!parsed.success) return Response.json({ error: "Revisa los datos del asociado." }, { status: 400 });
    return Response.json({ id: await createAssociate({ ...parsed.data, image: parsed.data.image || null }) }, { status: 201 });
  }
  return Response.json({ error: "Recurso no encontrado" }, { status: 404 });
}
