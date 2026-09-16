import { processStripeWebhook } from "../../../../lib/payment-automation";

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    const result = await processStripeWebhook(rawBody, request.headers.get("stripe-signature"));
    return Response.json({ received: true, result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar el evento de Stripe.";
    const invalid = message.includes("Firma") || message.includes("incompleto") || message.includes("JSON");
    return Response.json({ error: message }, { status: invalid ? 400 : 500, headers: { "cache-control": "no-store" } });
  }
}
