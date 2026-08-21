import { z } from "zod";
import { authenticate, requestIsSameOrigin, sessionCookie } from "../../../../lib/auth";
import { checkRateLimit, clearRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });
const limit = { max: 5, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 };
export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Ingresa un correo y una contraseña válidos." }, { status: 400 });
  const key = rateLimitKey(request, "admin-login", parsed.data.email);
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera unos minutos antes de volver a intentar." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter), "cache-control": "no-store" } });
  try {
    const token = await authenticate(parsed.data.email, parsed.data.password);
    if (!token) {
      recordRateLimitFailure(key, limit);
      return Response.json({ error: "Credenciales incorrectas o acceso aún no configurado." }, { status: 401, headers: { "cache-control": "no-store" } });
    }
    clearRateLimit(key);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "set-cookie": sessionCookie(token), "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "El acceso administrativo todavía no está configurado correctamente." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
