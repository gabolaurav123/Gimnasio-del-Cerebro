import { z } from "zod";
import { requestIsAdmin } from "../../../../lib/auth";
import { createTraining, getTrainings } from "../../../../db/repository";

const asset = z.string().trim().max(500).refine((value) => !value || /^\/(?:api\/media\/[a-z0-9-]+|logos\/[a-z0-9._/-]+|images\/[a-z0-9._/-]+)$/i.test(value), "Archivo inválido");
const checkoutUrl = z.string().trim().max(800).refine((value) => !value || /^https:\/\//i.test(value), "Usa una URL https://");
const schema = z.object({
  name: z.string().trim().min(3).max(150),
  acronym: z.string().trim().min(2).max(10),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().trim().min(10).max(500),
  fullDescription: z.string().trim().min(10).max(10000),
  logo: asset.refine(Boolean, "La imagen es obligatoria"),
  heroImage: asset.optional().default(""),
  resourceUrl: asset.optional().default(""),
  dashboardContent: z.string().trim().max(10000).optional().default(""),
  checkoutProvider: z.enum(["STRIPE", "HOTMART", "MANUAL"]).default("MANUAL"),
  checkoutUrl: checkoutUrl.optional().default(""),
  priceCents: z.coerce.number().int().min(0).max(1_000_000_000),
  currency: z.enum(["BOB", "USD", "EUR"]),
  displayOrder: z.coerce.number().int().min(0).max(999),
});
export async function GET(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); return Response.json({ trainings: await getTrainings(true) }); }
export async function POST(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 }); return Response.json({ id: await createTraining({ ...parsed.data, heroImage: parsed.data.heroImage || null, resourceUrl: parsed.data.resourceUrl || null, dashboardContent: parsed.data.dashboardContent || null, checkoutUrl: parsed.data.checkoutUrl || null }) }, { status: 201 }); }
