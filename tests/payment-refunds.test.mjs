import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifyStripeChargeRefund } from "../lib/payment-refunds.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Stripe distingue un reembolso parcial acumulado sin cerrar el pago", () => {
  assert.deepEqual(classifyStripeChargeRefund({ amount: 10_000, amount_refunded: 2_500, refunded: false }), {
    grossAmountCents: 10_000,
    refundedAmountCents: 2_500,
    fullRefund: false,
    paymentStatus: "VERIFIED",
  });
  assert.equal(classifyStripeChargeRefund({ amount: 10_000, amount_refunded: 6_500 }).refundedAmountCents, 6_500);
});

test("Stripe cierra el pago únicamente cuando el reembolso acumulado es total", () => {
  assert.deepEqual(classifyStripeChargeRefund({ amount: 10_000, amount_refunded: 10_000, refunded: true }), {
    grossAmountCents: 10_000,
    refundedAmountCents: 10_000,
    fullRefund: true,
    paymentStatus: "REFUNDED",
  });
  assert.throws(() => classifyStripeChargeRefund({ amount: 10_000, amount_refunded: 10_001 }), /supera el importe original/);
  assert.throws(() => classifyStripeChargeRefund({ amount: 10_000, amount_refunded: 2_500, refunded: true }), /importe inconsistente/);
});

test("la contabilidad conserva un solo parcial acumulado y el total lo reemplaza", async () => {
  const [automation, repository] = await Promise.all([
    read("../lib/payment-automation.ts"),
    read("../db/repository.ts"),
  ]);
  assert.match(automation, /classifyStripeChargeRefund/);
  assert.match(automation, /refundAmountCents = refund\.refundedAmountCents/);
  assert.doesNotMatch(automation, /eventType === "refund\.updated"/);
  assert.match(repository, /Reembolso parcial acumulado/);
  assert.match(repository, /ABS\(amount_cents\) < \?/);
  assert.match(repository, /DELETE FROM accounting_entries WHERE payment_id = \? AND category = 'Reembolso parcial'/);
  assert.match(repository, /partialRefundCents: isPartialRefund \? refundAmount : null/);
});
