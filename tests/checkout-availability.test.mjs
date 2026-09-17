import assert from "node:assert/strict";
import test from "node:test";
import { hasOnlineCheckout } from "../lib/checkout-availability.ts";

test("un precio Stripe permite comprar sin Payment Link", () => {
  assert.equal(hasOnlineCheckout({ checkoutProvider: "STRIPE", checkoutExternalId: "price_configured123", checkoutUrl: null }), true);
  assert.equal(hasOnlineCheckout({ checkoutProvider: "STRIPE", checkoutExternalId: "prod_configured123", checkoutUrl: null }), false);
  assert.equal(hasOnlineCheckout({ checkoutProvider: "STRIPE", checkoutExternalId: "price_", checkoutUrl: null }), false);
});

test("Hotmart conserva la exigencia de enlace y los artículos manuales no habilitan compra", () => {
  assert.equal(hasOnlineCheckout({ checkoutProvider: "HOTMART", checkoutExternalId: "123", checkoutUrl: "https://pay.hotmart.com/EXAMPLE" }), true);
  assert.equal(hasOnlineCheckout({ checkoutProvider: "HOTMART", checkoutExternalId: "price_example", checkoutUrl: " " }), false);
  assert.equal(hasOnlineCheckout({ checkoutProvider: "STRIPE", checkoutUrl: "https://buy.stripe.com/example" }), true);
  assert.equal(hasOnlineCheckout({ checkoutProvider: "MANUAL", checkoutUrl: "https://buy.stripe.com/example", checkoutExternalId: "price_example" }), false);
});
