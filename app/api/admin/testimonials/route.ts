import { z } from "zod";
import { createTestimonial, getTestimonials } from "../../../../db/repository";
import { requestIsAdmin } from "../../../../lib/auth";

const mediaPath = z.string().trim().max(500).refine((value) => !value || /^\/(?:api\/media\/[a-z0-9-]+|images\/[a-z0-9._/-]+)$/i.test(value));
export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(150),
  program: z.string().trim().max(150).optional().default(""),
  quote: z.string().trim().max(2000).optional().default(""),
  videoUrl: z.string().trim().max(500).refine((value) => !value || /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(value), "Usa un enlace de YouTube válido").optional().default(""),
  thumbnail: mediaPath.optional().default(""),
  rating: z.union([z.literal(""), z.coerce.number().int().min(1).max(5)]).optional().default(""),
  visible: z.boolean(),
  displayOrder: z.coerce.number().int().min(0).max(999),
});

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json({ testimonials: await getTestimonials(true) });
}

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = testimonialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const id = await createTestimonial({ ...data, program: data.program || null, quote: data.quote || null, videoUrl: data.videoUrl || null, thumbnail: data.thumbnail || null, rating: data.rating === "" ? null : data.rating });
  return Response.json({ id }, { status: 201 });
}
