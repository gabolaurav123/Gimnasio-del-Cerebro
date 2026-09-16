import assert from "node:assert/strict";
import test from "node:test";
import { buildPurchaseEmail, isRetryablePurchaseEmailStatus, purchaseEmailIdempotencyKey } from "../lib/purchase-email-content.ts";

const purchase = {
  paymentId: "payment-123",
  reference: "GDC-2026-001",
  recipient: "persona@example.com",
  payerName: "Ada <script>alert(1)</script>",
  concept: "Curso & Taller",
  provider: "HOTMART",
  providerReference: "HP-<123>",
  amountCents: 7900,
  currency: "USD",
  accountAccess: true,
};

test("el correo de compra escapa datos y muestra acceso solo cuando corresponde", () => {
  const withAccess = buildPurchaseEmail(purchase, "https://gimnasiodelcerebro.com/");
  assert.match(withAccess.html, /Ada &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(withAccess.html, /Curso &amp; Taller/);
  assert.match(withAccess.html, /Entrar a mi cuenta/);
  assert.doesNotMatch(withAccess.html, /<script>/);

  const withoutAccess = buildPurchaseEmail({ ...purchase, accountAccess: false });
  assert.doesNotMatch(withoutAccess.html, /Entrar a mi cuenta/);
  assert.match(withoutAccess.text, /mismo correo/);
});

test("clasifica como reintentables credenciales, límites y fallos del proveedor", () => {
  for (const status of [401, 403, 408, 409, 425, 429, 500, 503]) assert.equal(isRetryablePurchaseEmailStatus(status), true);
  for (const status of [400, 404, 422]) assert.equal(isRetryablePurchaseEmailStatus(status), false);
});

test("usa una clave idempotente estable por pago", () => {
  assert.equal(purchaseEmailIdempotencyKey("payment-123"), "purchase-confirmation/payment-123");
  assert.equal(purchaseEmailIdempotencyKey("payment-123"), purchaseEmailIdempotencyKey("payment-123"));
  assert.notEqual(purchaseEmailIdempotencyKey("payment-123"), purchaseEmailIdempotencyKey("payment-456"));
});
