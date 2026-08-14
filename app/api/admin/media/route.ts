import { env } from "cloudflare:workers";
import { requestIsAdmin } from "../../../../lib/auth";
import { getDatabase } from "../../../../db/repository";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);
export async function POST(request: Request) {
  if (!(await requestIsAdmin(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData(); const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 8 * 1024 * 1024) return Response.json({ error: "Usa una imagen PNG, JPEG, WebP o AVIF de hasta 8 MB." }, { status: 400 });
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"); const key = `media/${crypto.randomUUID()}-${safeName}`;
  const bucket = (env as unknown as { MEDIA?: R2Bucket }).MEDIA; if (!bucket) return Response.json({ error: "El almacenamiento multimedia no está disponible." }, { status: 503 });
  await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const db = await getDatabase(); await db.prepare(`INSERT INTO media_assets (id, name, key, mime_type, size) VALUES (?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), file.name, key, file.type, file.size).run();
  return Response.json({ name: file.name, key }, { status: 201 });
}
