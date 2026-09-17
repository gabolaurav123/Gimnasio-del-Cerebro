import { reconcileProviderPayment } from "../db/repository";
import { buildTrackedHotmartUrl, parseHotmartWebhook } from "./hotmart-automation";
import { classifyStripeChargeRefund } from "./payment-refunds";
import { getRuntimeValues } from "./runtime-env";
import { sha256, verifyHotmartToken, verifyStripeSignature } from "./payment-security";
import { getSiteOrigin } from "./site-url";
import { buildStripeCheckoutDestination, stripeExternalItemId, type StripeCheckoutInput } from "./stripe-checkout";

export { StripeCheckoutError } from "./stripe-checkout";

type CheckoutDestinationInput = StripeCheckoutInput & {
  provider: "STRIPE" | "HOTMART";
};

export async function buildCheckoutDestination(input: CheckoutDestinationInput) {
  if (input.provider === "STRIPE") {
    const [runtime, origin] = await Promise.all([getRuntimeValues(["STRIPE_SECRET_KEY"]), getSiteOrigin()]);
    return buildStripeCheckoutDestination(input, { secret: runtime.STRIPE_SECRET_KEY?.trim() || "", origin });
  }
  return buildTrackedHotmartUrl(input.checkoutUrl, input.paymentId);
}

type StripeEvent = { id?: string; type?: string; data?: { object?: Record<string, unknown> } };

function objectValue(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function centsValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : null;
}

export async function processStripeWebhook(rawBody: string, signature: string | null) {
  const runtime = await getRuntimeValues(["STRIPE_WEBHOOK_SECRET"]);
  const secret = runtime.STRIPE_WEBHOOK_SECRET?.trim() || "";
  if (!await verifyStripeSignature(rawBody, signature, secret)) throw new Error("Firma de Stripe inválida.");
  const event = JSON.parse(rawBody) as StripeEvent;
  if (!event.id || !event.type || !event.data?.object) throw new Error("Evento de Stripe incompleto.");
  const object = event.data.object;
  const customerDetails = objectValue(object.customer_details);
  const billingDetails = objectValue(object.billing_details);
  const metadata = objectValue(object.metadata);
  const eventType = event.type;
  let status: "PENDING" | "VERIFIED" | "REJECTED" | "REFUNDED" | null = null;
  let refundAmountCents: number | null = null;
  let refundIsFull = false;
  if (eventType === "checkout.session.async_payment_succeeded") status = "VERIFIED";
  if (eventType === "checkout.session.completed") status = object.payment_status === "paid" ? "VERIFIED" : "PENDING";
  if (["checkout.session.expired", "checkout.session.async_payment_failed"].includes(eventType)) status = "REJECTED";
  if (eventType === "charge.refunded") {
    const refund = classifyStripeChargeRefund(object);
    status = refund.paymentStatus;
    refundAmountCents = refund.refundedAmountCents;
    refundIsFull = refund.fullRefund;
  }
  if (!status) return { ignored: true, reason: "Evento no administrado" };
  const isChargeRefund = eventType === "charge.refunded";
  const providerReference = stringValue(object.payment_intent) || stringValue(object.id);
  const created = typeof object.created === "number" ? new Date(object.created * 1000).toISOString() : new Date().toISOString();
  return reconcileProviderPayment({
    provider: "STRIPE",
    eventId: event.id,
    eventType,
    payloadHash: await sha256(rawBody),
    localPaymentId: stringValue(object.client_reference_id) || stringValue(metadata.gdc_payment_id),
    externalItemId: stripeExternalItemId(metadata),
    providerReference,
    status,
    payerName: stringValue(customerDetails.name) || stringValue(billingDetails.name),
    payerEmail: stringValue(customerDetails.email) || stringValue(billingDetails.email),
    payerPhone: stringValue(customerDetails.phone) || stringValue(billingDetails.phone),
    amountCents: centsValue(isChargeRefund ? object.amount : object.amount_total),
    refundAmountCents,
    refundIsFull,
    currency: stringValue(object.currency),
    paidAt: !isChargeRefund && status === "VERIFIED" ? created : null,
    eventOccurredAt: created,
    paymentMethod: "CARD",
  });
}

export async function processHotmartWebhook(rawBody: string, receivedToken: string | null) {
  const runtime = await getRuntimeValues(["HOTMART_WEBHOOK_TOKEN"]);
  if (!verifyHotmartToken(receivedToken, runtime.HOTMART_WEBHOOK_TOKEN)) throw new Error("Token de Hotmart inválido.");
  const payload = JSON.parse(rawBody) as unknown;
  const payloadHash = await sha256(rawBody);
  const event = parseHotmartWebhook(payload, payloadHash);
  return reconcileProviderPayment({
    provider: "HOTMART",
    ...event,
    payloadHash,
  });
}
