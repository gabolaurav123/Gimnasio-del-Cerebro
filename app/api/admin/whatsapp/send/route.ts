import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { sendWhatsAppText } from "../../../../../lib/evolution-api";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../../lib/rate-limit";

const schema = z.object({ number: z.string().regex(/^\d{8,18}$/), message: z.string().trim().min(1).max(3000) });
const limit = { max: 30, windowMs: 60 * 60 * 1000, blockMs: 30 * 60 * 1000 };

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const key = rateLimitKey(request, "whatsapp-manual");
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Se alcanzó el límite temporal de envíos." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Número o mensaje inválido." }, { status: 400 });
  try { await sendWhatsAppText(parsed.data.number, parsed.data.message); return Response.json({ ok: true }); }
  catch (error) { recordRateLimitFailure(key, limit); return Response.json({ error: error instanceof Error ? error.message : "No se pudo enviar el mensaje." }, { status: 502 }); }
}
