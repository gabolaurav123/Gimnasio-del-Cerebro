import assert from "node:assert/strict";
import test from "node:test";
import { buildStripeCheckoutDestination, stripeExternalItemId } from "../lib/stripe-checkout.ts";

const input = {
  checkoutUrl: "https://buy.stripe.com/currentAccountLink?prefilled_promo_code=EVENTO",
  paymentId: "payment-local-123",
  payerEmail: "persona@example.com",
  itemName: "Artículo de ejemplo",
  amountCents: 5000,
  currency: "USD",
};
const configuration = { secret: "sk_test_unit_testing_only", origin: "https://gimnasiodelcerebro.com" };

test("Stripe utiliza el Price configurado sin crear otro importe y conserva referencia y regreso", async () => {
  let request;
  const result = await buildStripeCheckoutDestination({ ...input, checkoutExternalId: "price_configured123", amountCents: 0 }, configuration, async (url, init) => {
    request = { url, init, body: new URLSearchParams(init.body) };
    return Response.json({ url: "https://checkout.stripe.com/c/pay/cs_test_example" });
  });
  assert.equal(result, "https://checkout.stripe.com/c/pay/cs_test_example");
  assert.equal(request.body.get("line_items[0][price]"), "price_configured123");
  assert.equal(request.body.has("line_items[0][price_data][unit_amount]"), false);
  assert.equal(request.body.get("client_reference_id"), input.paymentId);
  assert.equal(request.body.get("payment_intent_data[metadata][gdc_payment_id]"), input.paymentId);
  assert.equal(request.body.get("metadata[gdc_external_item_id]"), "price_configured123");
  assert.match(request.body.get("success_url"), /^https:\/\/gimnasiodelcerebro\.com\/pago\/resultado\?/);
  assert.match(request.body.get("success_url"), /session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.equal(request.init.headers["idempotency-key"], `gdc-checkout-${input.paymentId}`);
});

test("un error API no redirige al Payment Link ni permite cobros en otra cuenta", async () => {
  let calls = 0;
  await assert.rejects(buildStripeCheckoutDestination(input, configuration, async () => {
    calls += 1;
    return Response.json({ error: { message: "Invalid API key: do-not-expose" } }, { status: 401 });
  }), (error) => !error.message.includes("do-not-expose") && error.name === "StripeCheckoutError");
  assert.equal(calls, 1);
});

test("un enlace que pertenece a otra cuenta se rechaza antes de redirigir", async () => {
  await assert.rejects(buildStripeCheckoutDestination({ ...input, amountCents: 0 }, configuration, async () => Response.json({
    data: [{ id: "plink_new", url: "https://buy.stripe.com/differentLink", active: true }], has_more: false,
  })), /cuenta de Stripe configurada/);
});

test("el Payment Link verificado conserva sus opciones y añade la referencia del comprador", async () => {
  const result = new URL(await buildStripeCheckoutDestination({ ...input, amountCents: 0 }, configuration, async (url) => {
    assert.match(url, /^https:\/\/api\.stripe\.com\/v1\/payment_links\?/);
    return Response.json({ data: [{ id: "plink_current", url: "https://buy.stripe.com/currentAccountLink", active: true }], has_more: false });
  }));
  assert.equal(result.searchParams.get("client_reference_id"), input.paymentId);
  assert.equal(result.searchParams.get("prefilled_email"), input.payerEmail);
  assert.equal(result.searchParams.get("prefilled_promo_code"), "EVENTO");
});

test("sin clave Stripe o con enlace ajeno no se contacta al proveedor", async () => {
  let calls = 0;
  const fetcher = async () => { calls += 1; return Response.json({}); };
  await assert.rejects(buildStripeCheckoutDestination(input, { ...configuration, secret: "" }, fetcher), /todavía no está configurado/);
  await assert.rejects(buildStripeCheckoutDestination({ ...input, amountCents: 0, checkoutUrl: "https://example.com/checkout" }, configuration, fetcher), /enlace de pago/);
  assert.equal(calls, 0);
});

test("solo metadata de identificador válido puede conciliar una compra directa", () => {
  assert.equal(stripeExternalItemId({ gdc_external_item_id: " prod_configured123 " }), "prod_configured123");
  assert.equal(stripeExternalItemId({ gdc_external_item_id: "https://bad.example/item" }), null);
  assert.equal(stripeExternalItemId({ gdc_external_item_id: "a".repeat(121) }), null);
  assert.equal(stripeExternalItemId({}), null);
});
