import { z } from "zod";
import { authenticate, clearSessionCookie, requestIsSameOrigin, sessionCookie } from "../../../../lib/auth";
import { authenticateCustomer, clearCustomerSessionCookie, customerSessionCookie } from "../../../../lib/customer-auth";
import { checkRateLimit, clearRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(180), password: z.string().min(8).max(200) });
const limit = { max: 6, windowMs: 15 * 60 * 1000, blockMs: 15 * 60 * 1000 };

function accessResponse(destination: "/admin" | "/mi-cuenta", cookie: string, clearCookie: string) {
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  headers.append("set-cookie", cookie);
  headers.append("set-cookie", clearCookie);
  return new Response(JSON.stringify({ ok: true, destination }), { status: 200, headers });
}

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Ingresa un correo y una contraseña válidos." }, { status: 400 });
  const key = rateLimitKey(request, "account-access", parsed.data.email);
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera unos minutos antes de volver a intentar." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter), "cache-control": "no-store" } });
  try {
    const adminToken = await authenticate(parsed.data.email, parsed.data.password);
    if (adminToken) {
      clearRateLimit(key);
      return accessResponse("/admin", sessionCookie(adminToken), clearCustomerSessionCookie());
    }
    const customerToken = await authenticateCustomer(parsed.data.email, parsed.data.password);
    if (customerToken) {
      clearRateLimit(key);
      return accessResponse("/mi-cuenta", customerSessionCookie(customerToken), clearSessionCookie());
    }
    recordRateLimitFailure(key, limit);
    return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos verificar el acceso en este momento. Inténtalo nuevamente." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
