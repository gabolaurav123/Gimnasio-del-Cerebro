import { z } from "zod";
import { AppointmentUnavailableError, createAppointment } from "../../../db/repository";
import { appointmentSlots, getAppointmentAvailability } from "../../../db/scheduling";
import { requestIsSameOrigin } from "../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  country: z.string().trim().min(2).max(80),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/),
  appointmentType: z.enum(["CONSULTATION", "TRAINING"]),
  acceptedDisclaimer: z.union([z.literal(true), z.literal("on")]),
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
    const selected = new Date(`${parsed.data.preferredDate}T${parsed.data.preferredTime}:00-04:00`);
    if (!Number.isFinite(selected.getTime()) || selected.getTime() < Date.now() - 60_000 || !appointmentSlots.includes(parsed.data.preferredTime)) return Response.json({ error: "Selecciona una fecha y hora futuras disponibles." }, { status: 400 });
    const availability = await getAppointmentAvailability(parsed.data.preferredDate, parsed.data.appointmentType);
    if (!availability.some((slot) => slot.time === parsed.data.preferredTime && slot.available)) return Response.json({ error: "Ese horario acaba de ocuparse o está bloqueado. Elige otro." }, { status: 409 });
    const id = await createAppointment({
      name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, country: parsed.data.country,
      preferredDate: parsed.data.preferredDate, preferredTime: parsed.data.preferredTime,
      trainingInterest: parsed.data.trainingInterest || null, appointmentType: parsed.data.appointmentType,
      disclaimerAcceptedAt: new Date().toISOString(), message: parsed.data.message,
    });
    recordRateLimitFailure(key, limit);
    return Response.json({ id, message: "Tu cita quedó registrada. Te contactaremos para confirmarla." }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof AppointmentUnavailableError) return Response.json({ error: "Ese horario ya no está disponible. Elige otro." }, { status: 409 });
    return Response.json({ error: "No pudimos registrar la cita. Inténtalo nuevamente." }, { status: 500 });
  }
}
