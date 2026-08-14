import { z } from "zod";
import { requestIsAdmin } from "../../../../lib/auth";
import { createPost, getPosts } from "../../../../db/repository";
const schema = z.object({ title: z.string().trim().min(5).max(220), slug: z.string().regex(/^[a-z0-9-]+$/), excerpt: z.string().trim().min(10).max(500), content: z.string().trim().min(10).max(20000), category: z.string().trim().min(2).max(80) });
export async function GET(request: Request) { if (!(await requestIsAdmin(request))) return Response.json({ error: "No autorizado" }, { status: 401 }); return Response.json({ posts: await getPosts(true) }); }
export async function POST(request: Request) { if (!(await requestIsAdmin(request))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 }); return Response.json({ id: await createPost(parsed.data) }, { status: 201 }); }
