export type StripeCheckoutInput = {
  checkoutUrl: string;
  checkoutExternalId?: string | null;
  paymentId: string;
  payerEmail: string;
  itemName: string;
  amountCents: number;
  currency: string;
};

export class StripeCheckoutError extends Error {
  constructor(message = "No pudimos abrir el pago seguro. Inténtalo de nuevo en unos minutos.") {
    super(message);
    this.name = "StripeCheckoutError";
  }
}

export function stripeExternalItemId(metadata: Record<string, unknown>) {
  const value = metadata.gdc_external_item_id;
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,120}$/.test(value.trim()) ? value.trim() : null;
}

function stripePaymentLink(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "buy.stripe.com" && !url.username && !url.password && url.pathname !== "/") return url;
  } catch { /* Report the same configuration error for every invalid URL. */ }
  throw new StripeCheckoutError("El enlace de pago todavía no está disponible. Contacta con el equipo.");
}

async function stripeRequest(path: string, secret: string, fetcher: typeof fetch, init: RequestInit = {}) {
  let response: Response;
  try {
    response = await fetcher(`https://api.stripe.com/v1/${path}`, {
      ...init,
      headers: { authorization: `Bearer ${secret}`, ...init.headers },
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new StripeCheckoutError();
  }
  if (!response.ok) throw new StripeCheckoutError();
  return response.json().catch(() => { throw new StripeCheckoutError(); }) as Promise<Record<string, unknown>>;
}

async function trackedAccountPaymentLink(input: StripeCheckoutInput, secret: string, fetcher: typeof fetch) {
  const url = stripePaymentLink(input.checkoutUrl);
  let startingAfter = "";
  // Verify ownership with the configured account before sending a customer to a stored link.
  for (let page = 0; page < 10; page += 1) {
    const query = new URLSearchParams({ active: "true", limit: "100" });
    if (startingAfter) query.set("starting_after", startingAfter);
    const payload = await stripeRequest(`payment_links?${query}`, secret, fetcher);
    const links = Array.isArray(payload.data) ? payload.data as Array<{ id?: string; url?: string; active?: boolean }> : [];
    if (links.some((link) => {
      if (!link.active || !link.url) return false;
      try {
        const owned = new URL(link.url);
        return owned.origin === url.origin && owned.pathname === url.pathname;
      } catch { return false; }
    })) {
      url.hash = "";
      url.searchParams.set("client_reference_id", input.paymentId);
      url.searchParams.set("prefilled_email", input.payerEmail);
      return url.toString();
    }
    if (!payload.has_more || !links.length || !links.at(-1)?.id) break;
    startingAfter = links.at(-1)!.id!;
  }
  throw new StripeCheckoutError("Este enlace de pago no está disponible en la cuenta de Stripe configurada. Contacta con el equipo.");
}

export async function buildStripeCheckoutDestination(
  input: StripeCheckoutInput,
  configuration: { secret: string; origin: string },
  fetcher: typeof fetch = fetch,
) {
  const secret = configuration.secret.trim();
  if (!/^(sk|rk)_(live|test)_/.test(secret)) throw new StripeCheckoutError("El pago todavía no está configurado. Contacta con el equipo.");
  const externalId = input.checkoutExternalId?.trim() || "";
  if (externalId.startsWith("price_") && !/^price_[A-Za-z0-9]+$/.test(externalId)) throw new StripeCheckoutError("El precio de Stripe no está configurado correctamente.");
  const priceId = /^price_[A-Za-z0-9]+$/.test(externalId) ? externalId : null;
  if (!priceId && input.amountCents <= 0) return trackedAccountPaymentLink(input, secret, fetcher);
  if (!priceId && (!Number.isSafeInteger(input.amountCents) || !/^[A-Z]{3}$/i.test(input.currency))) throw new StripeCheckoutError("El importe del pago no está configurado correctamente.");

  const body = new URLSearchParams({
    mode: "payment",
    client_reference_id: input.paymentId,
    customer_email: input.payerEmail,
    success_url: `${configuration.origin}/pago/resultado?provider=stripe&payment_id=${encodeURIComponent(input.paymentId)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${configuration.origin}/pago/resultado?provider=stripe&payment_id=${encodeURIComponent(input.paymentId)}&state=cancelled`,
    "line_items[0][quantity]": "1",
    "metadata[gdc_payment_id]": input.paymentId,
    "payment_intent_data[metadata][gdc_payment_id]": input.paymentId,
  });
  if (priceId) body.set("line_items[0][price]", priceId);
  else {
    body.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
    body.set("line_items[0][price_data][unit_amount]", String(input.amountCents));
    body.set("line_items[0][price_data][product_data][name]", input.itemName);
  }
  if (stripeExternalItemId({ gdc_external_item_id: externalId })) {
    body.set("metadata[gdc_external_item_id]", externalId);
    body.set("payment_intent_data[metadata][gdc_external_item_id]", externalId);
  }
  const payload = await stripeRequest("checkout/sessions", secret, fetcher, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "idempotency-key": `gdc-checkout-${input.paymentId}` },
    body,
  });
  if (typeof payload.url !== "string") throw new StripeCheckoutError();
  try {
    const destination = new URL(payload.url);
    if (destination.protocol === "https:" && destination.hostname === "checkout.stripe.com" && !destination.username && !destination.password) return destination.toString();
  } catch { /* Invalid API response must never trigger a Payment Link fallback. */ }
  throw new StripeCheckoutError();
}
