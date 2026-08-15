import { getMedia } from "../../../../db/repository";
import { getCloudflareBindings } from "../../../../lib/runtime-env";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await getMedia(id);
  if (!media) return Response.json({ error: "Archivo no encontrado" }, { status: 404 });

  const contentType = String(media.mime_type || "application/octet-stream");
  if (media.body) {
    const body = media.body instanceof Uint8Array ? media.body : new Uint8Array(media.body as ArrayBuffer);
    return new Response(Uint8Array.from(body).buffer, { headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" } });
  }

  const { MEDIA: bucket } = await getCloudflareBindings();
  const object = bucket ? await bucket.get(String(media.key)) : null;
  if (!object) return Response.json({ error: "Archivo no encontrado" }, { status: 404 });
  return new Response(object.body, { headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" } });
}
