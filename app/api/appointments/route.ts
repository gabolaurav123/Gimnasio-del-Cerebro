import { z } from "zod";
import { createAppointment } from "../../../db/repository";
import { requestIsSameOrigin } from "../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  country: z.string().trim().min(2).max(80),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
  trainingInterest: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().max(1200).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

const limit = { max: 4, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 };

export async function POST(request: Request) {
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const key = rateLimitKey(request, "public-appointment");
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Ya recibimos varias solicitudes. Inténtalo más tarde." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Revisa los campos e inténtalo nuevamente." }, { status: 400 });
    const selected = new Date(`${parsed.data.preferredDate}T${parsed.data.preferredTime}:00`);
    if (!Number.isFinite(selected.getTime()) || selected.getTime() < Date.now() - 60_000) return Response.json({ error: "Selecciona una fecha y hora futuras." }, { status: 400 });
    const id = await createAppointment({
      name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, country: parsed.data.country,
      preferredDate: parsed.data.preferredDate, preferredTime: parsed.data.preferredTime,
      trainingInterest: parsed.data.trainingInterest || null, message: parsed.data.message,
    });
    recordRateLimitFailure(key, limit);
    return Response.json({ id, message: "Tu cita quedó registrada. Te contactaremos para confirmarla." }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos registrar la cita. Inténtalo nuevamente." }, { status: 500 });
  }
}
