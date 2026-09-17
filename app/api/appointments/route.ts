import { z } from "zod";
import { AppointmentUnavailableError, createAppointment, createPayment, updateAppointmentStatus, updatePaymentStatus } from "../../../db/repository";
import { appointmentSlotsForDate, getAppointmentAvailability } from "../../../db/scheduling";
import { requestIsSameOrigin } from "../../../lib/auth";
import { buildCheckoutDestination, StripeCheckoutError } from "../../../lib/payment-automation";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../lib/rate-limit";
import { getRuntimeValues } from "../../../lib/runtime-env";

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
  let createdAppointmentId: string | null = null;
  let createdPaymentId: string | null = null;
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const key = rateLimitKey(request, "public-appointment");
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Ya recibimos varias solicitudes. Inténtalo más tarde." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Revisa los campos e inténtalo nuevamente." }, { status: 400 });
    const slotsForDate = appointmentSlotsForDate(parsed.data.preferredDate);
    if (!slotsForDate.length) return Response.json({ error: "La atención se realiza martes, jueves y viernes. Elige una fecha habilitada." }, { status: 400 });
    const selected = new Date(`${parsed.data.preferredDate}T${parsed.data.preferredTime}:00-04:00`);
    if (!Number.isFinite(selected.getTime()) || selected.getTime() < Date.now() - 60_000 || !slotsForDate.includes(parsed.data.preferredTime)) return Response.json({ error: "Selecciona una fecha y hora futuras disponibles." }, { status: 400 });
    const availability = await getAppointmentAvailability(parsed.data.preferredDate, parsed.data.appointmentType);
    if (!availability.some((slot) => slot.time === parsed.data.preferredTime && slot.available)) return Response.json({ error: "Ese horario acaba de ocuparse o está bloqueado. Elige otro." }, { status: 409 });
    const id = await createAppointment({
      name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, country: parsed.data.country,
      preferredDate: parsed.data.preferredDate, preferredTime: parsed.data.preferredTime,
      trainingInterest: parsed.data.trainingInterest || null, appointmentType: parsed.data.appointmentType,
      disclaimerAcceptedAt: new Date().toISOString(), message: parsed.data.message,
    });
    createdAppointmentId = id;
    let paymentUrl: string | null = null;
    if (parsed.data.appointmentType === "CONSULTATION") {
      const runtime = await getRuntimeValues(["STRIPE_CONSULTATION_LINK", "STRIPE_CONSULTATION_PRICE_ID", "STRIPE_CONSULTATION_AMOUNT_CENTS", "STRIPE_CONSULTATION_CURRENCY"]);
      const checkoutUrl = runtime.STRIPE_CONSULTATION_LINK?.trim() || "";
      const checkoutExternalId = runtime.STRIPE_CONSULTATION_PRICE_ID?.trim() || "";
      if (!checkoutUrl && !/^price_[A-Za-z0-9]+$/.test(checkoutExternalId)) throw new StripeCheckoutError("El pago de consultas todavía no está disponible. Contacta con el equipo.");
      const amountCents = Math.max(0, Number.parseInt(runtime.STRIPE_CONSULTATION_AMOUNT_CENTS || "0", 10) || 0);
      const currency = (runtime.STRIPE_CONSULTATION_CURRENCY?.trim() || "USD").toUpperCase();
      const payment = await createPayment({
        payerName: parsed.data.name,
        payerEmail: parsed.data.email,
        payerPhone: parsed.data.phone,
        concept: `Consulta personalizada · ${parsed.data.preferredDate} ${parsed.data.preferredTime}`,
        itemType: "OTHER",
        itemId: id,
        amountCents,
        currency,
        paymentMethod: "CARD",
        providerReference: null,
        paidAt: null,
        notes: "Pago Stripe asociado a una cita. La cita se confirma únicamente tras el webhook firmado.",
        source: "STRIPE",
      });
      createdPaymentId = payment.id;
      paymentUrl = await buildCheckoutDestination({ provider: "STRIPE", checkoutUrl, checkoutExternalId, paymentId: payment.id, payerEmail: parsed.data.email, itemName: "Consulta personalizada · Gimnasio del Cerebro", amountCents, currency });
    }
    recordRateLimitFailure(key, limit);
    return Response.json({ id, paymentUrl, message: paymentUrl ? "Tu horario quedó reservado provisionalmente. Completa el pago seguro para confirmarlo." : "Tu cita quedó registrada. Te contactaremos para confirmarla." }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (createdAppointmentId) {
      const cleanup = await Promise.allSettled([
        updateAppointmentStatus(createdAppointmentId, "CANCELLED"),
        ...(createdPaymentId ? [updatePaymentStatus(createdPaymentId, "REJECTED", "No se pudo iniciar el pago")] : []),
      ]);
      if (cleanup.some((result) => result.status === "rejected")) console.error("No se pudo liberar por completo la reserva tras un error de pago.");
    }
    if (error instanceof AppointmentUnavailableError) return Response.json({ error: "Ese horario ya no está disponible. Elige otro." }, { status: 409 });
    if (error instanceof StripeCheckoutError) return Response.json({ error: error.message }, { status: 503, headers: { "cache-control": "no-store" } });
    return Response.json({ error: "No pudimos registrar la cita. Inténtalo nuevamente." }, { status: 500 });
  }
}
