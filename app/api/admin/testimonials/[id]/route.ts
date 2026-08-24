import { testimonialSchema } from "../route";
import { updateTestimonial } from "../../../../../db/repository";
import { requestIsAdmin } from "../../../../../lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = testimonialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  await updateTestimonial((await context.params).id, { ...data, program: data.program || null, quote: data.quote || null, videoUrl: data.videoUrl || null, thumbnail: data.thumbnail || null, rating: data.rating === "" ? null : data.rating });
  return Response.json({ ok: true });
}
