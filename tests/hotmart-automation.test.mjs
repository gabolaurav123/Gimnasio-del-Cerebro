import assert from "node:assert/strict";
import test from "node:test";
import { buildTrackedHotmartUrl, parseHotmartWebhook } from "../lib/hotmart-automation.ts";

const checkoutInput = {
  provider: "HOTMART",
  checkoutUrl: "https://pay.hotmart.com/V96727899W?off=oferta-principal&sck=anterior",
  paymentId: "payment-local-123",
  payerEmail: "persona@example.com",
  itemName: "Cartas Neurofitness Active",
  amountCents: 12_500,
  currency: "USD",
};

test("el checkout Hotmart conserva la oferta y vincula el intento local mediante sck", () => {
  const destination = new URL(buildTrackedHotmartUrl(checkoutInput.checkoutUrl, checkoutInput.paymentId));

  assert.equal(destination.origin, "https://pay.hotmart.com");
  assert.equal(destination.pathname, "/V96727899W");
  assert.equal(destination.searchParams.get("off"), "oferta-principal");
  assert.equal(destination.searchParams.get("sck"), checkoutInput.paymentId);
  assert.equal(destination.searchParams.get("src"), "gdc_web");
  assert.equal(destination.searchParams.getAll("sck").length, 1);
});

test("Hotmart convierte una compra aprobada y conserva la referencia local para otorgar acceso", () => {
  const approvedAt = Date.UTC(2026, 8, 16, 14, 30);
  const parsed = parseHotmartWebhook({
    id: "hotmart-event-1",
    event: "purchase_approved",
    data: {
      product: { id: 4_768_798 },
      buyer: {
        name: "María Ejemplo",
        email: "maria@example.com",
        checkout_phone: "+59170000000",
      },
      purchase: {
        transaction: "HP123456",
        approved_date: approvedAt,
        price: { value: "125.50", currency_code: "USD" },
        payment: { type: "CREDIT_CARD" },
        tracking: { source_sck: "payment-local-123" },
      },
    },
  }, "hash-evento");

  assert.deepEqual(parsed, {
    eventId: "hotmart-event-1",
    eventType: "PURCHASE_APPROVED",
    localPaymentId: "payment-local-123",
    providerReference: "HP123456",
    externalItemId: "4768798",
    status: "VERIFIED",
    payerName: "María Ejemplo",
    payerEmail: "maria@example.com",
    payerPhone: "+59170000000",
    amountCents: 12_550,
    currency: "USD",
    paidAt: new Date(approvedAt).toISOString(),
    paymentMethod: "CREDIT CARD",
  });
});

test("Hotmart reconoce reembolsos y compras directas por el ID externo del producto", () => {
  const parsed = parseHotmartWebhook({
    event: "PURCHASE_REFUNDED",
    data: {
      product: { id: "4473112" },
      buyer: { email: "comprador@example.com" },
      purchase: {
        transaction: "HP-REFUND-1",
        price: { value: 49.99, currency_code: "eur" },
      },
    },
  }, "hash-estable");

  assert.equal(parsed.eventId, "PURCHASE_REFUNDED:HP-REFUND-1");
  assert.equal(parsed.status, "REFUNDED");
  assert.equal(parsed.externalItemId, "4473112");
  assert.equal(parsed.localPaymentId, null);
  assert.equal(parsed.amountCents, 4_999);
  assert.equal(parsed.paidAt, null);
});
