import bcrypt from "bcryptjs";
import { z } from "zod";
import { createCustomer, getCustomerByEmail } from "../../../../../db/customer-repository";
import { authenticateCustomer, customerSessionCookie } from "../../../../../lib/customer-auth";
import { requestIsSameOrigin } from "../../../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../../lib/rate-limit";
import { getRuntimeValues } from "../../../../../lib/runtime-env";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  password: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
  phone: z.string().trim().max(40).optional().default(""),
  country: z.string().trim().max(80).optional().default(""),
  acceptedTerms: z.literal(true),
  acceptedPrivacy: z.literal(true),
});
const limit = { max: 4, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  const key = rateLimitKey(request, "customer-register");
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Demasiados intentos. Espera antes de volver a intentarlo." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa los datos. La contraseña debe tener al menos 10 caracteres, mayúscula, minúscula y número." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  if (await getCustomerByEmail(email)) return Response.json({ error: "Ya existe una cuenta con este correo. Inicia sesión." }, { status: 409 });
  try {
    const env = await getRuntimeValues(["TERMS_VERSION"]);
    await createCustomer({ name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 12), phone: parsed.data.phone || null, country: parsed.data.country || null, termsVersion: env.TERMS_VERSION || "2026-08-31" });
    const token = await authenticateCustomer(email, parsed.data.password);
    if (!token) throw new Error("Sesión no configurada");
    return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "content-type": "application/json", "set-cookie": customerSessionCookie(token), "cache-control": "no-store" } });
  } catch {
    recordRateLimitFailure(key, limit);
    return Response.json({ error: "No pudimos crear la cuenta. Inténtalo nuevamente." }, { status: 500 });
  }
}
