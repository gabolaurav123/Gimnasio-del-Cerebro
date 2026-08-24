import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { setPostStatus, updatePost } from "../../../../../db/repository";
const statusSchema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) });
const contentSchema = z.object({ title: z.string().trim().min(5).max(220), slug: z.string().regex(/^[a-z0-9-]+$/), excerpt: z.string().trim().min(10).max(500), content: z.string().trim().min(10).max(30000), category: z.string().trim().min(2).max(80), author: z.string().trim().max(120).optional().default(""), image: z.string().trim().max(500).refine((value) => !value || /^\/api\/media\/[a-z0-9-]+$/i.test(value)).optional().default(""), attachmentUrl: z.string().trim().max(500).refine((value) => !value || /^\/api\/media\/[a-z0-9-]+$/i.test(value)).optional().default("") });
const schema = z.union([statusSchema, contentSchema]);
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 });
  const id = (await context.params).id;
  if ("status" in parsed.data) await setPostStatus(id, parsed.data.status);
  else await updatePost(id, { ...parsed.data, image: parsed.data.image || null, attachmentUrl: parsed.data.attachmentUrl || null, author: parsed.data.author || null });
  return Response.json({ ok: true });
}
