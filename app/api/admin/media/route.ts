import { saveMedia } from "../../../../db/repository";
import { getRuntimeDatabase } from "../../../../db/runtime";
import { requestIsAdmin } from "../../../../lib/auth";
import { getCloudflareBindings } from "../../../../lib/runtime-env";

const allowed = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "Usa una imagen PNG, JPEG, WebP o AVIF de hasta 8 MB." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const key = `media/${id}-${safeName}`;
  const db = await getRuntimeDatabase();

  if (db.dialect === "postgres") {
    await saveMedia({ id, name: file.name, key, mimeType: file.type, size: file.size, body: new Uint8Array(await file.arrayBuffer()) });
    return Response.json({ name: file.name, key, url: `/api/media/${id}` }, { status: 201 });
  }

  const { MEDIA: bucket } = await getCloudflareBindings();
  if (!bucket) return Response.json({ error: "El almacenamiento multimedia no está disponible." }, { status: 503 });
  await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  await saveMedia({ id, name: file.name, key, mimeType: file.type, size: file.size });
  return Response.json({ name: file.name, key }, { status: 201 });
}
