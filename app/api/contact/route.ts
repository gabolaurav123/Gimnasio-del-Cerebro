import { z } from "zod";
import { createContact } from "../../../db/repository";
import { requestIsSameOrigin } from "../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  country: z.string().trim().min(2).max(80),
  trainingInterest: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(1200),
  website: z.string().max(0).optional().default(""),
});

const limit = { max: 5, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const key = rateLimitKey(request, "public-contact");
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Ya recibimos varias consultas desde esta conexión. Inténtalo más tarde." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
    const parsed = contactSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Revisa los campos e inténtalo nuevamente." }, { status: 400 });
    const contact = { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, country: parsed.data.country, trainingInterest: parsed.data.trainingInterest, message: parsed.data.message };
    const id = await createContact(contact);
    recordRateLimitFailure(key, limit);
    return Response.json({ id, message: "Recibimos tu consulta y quedó registrada para seguimiento." }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos registrar la consulta. Inténtalo nuevamente." }, { status: 500 });
  }
}
