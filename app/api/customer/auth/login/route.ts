import { z } from "zod";
import { authenticateCustomer, customerSessionCookie } from "../../../../../lib/customer-auth";
import { requestIsSameOrigin } from "../../../../../lib/auth";
import { checkRateLimit, clearRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../../lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(180), password: z.string().min(8).max(128) });
const limit = { max: 6, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Ingresa un correo y una contraseña válidos." }, { status: 400 });
  const key = rateLimitKey(request, "customer-login", parsed.data.email);
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
  const token = await authenticateCustomer(parsed.data.email, parsed.data.password);
  if (!token) {
    recordRateLimitFailure(key, limit);
    return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401, headers: { "cache-control": "no-store" } });
  }
  clearRateLimit(key);
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": customerSessionCookie(token), "cache-control": "no-store" } });
}
