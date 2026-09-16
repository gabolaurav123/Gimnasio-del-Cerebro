type HotmartStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REFUNDED";

function objectValue(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function decimalToCents(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100)) : null;
}

export function buildTrackedHotmartUrl(checkoutUrl: string, paymentId: string) {
  const url = new URL(checkoutUrl);
  url.searchParams.set("sck", paymentId);
  url.searchParams.set("src", "gdc_web");
  return url.toString();
}

export function parseHotmartWebhook(payloadValue: unknown, fallbackEventId: string, now = new Date()) {
  const payload = objectValue(payloadValue);
  const data = objectValue(payload.data);
  const purchase = objectValue(data.purchase);
  const buyer = objectValue(data.buyer);
  const product = objectValue(data.product);
  const price = objectValue(purchase.price);
  const payment = objectValue(purchase.payment);
  const tracking = objectValue(purchase.tracking);
  const eventType = (stringValue(payload.event) || stringValue(purchase.status) || "UNKNOWN").toUpperCase();
  let status: HotmartStatus = "PENDING";
  if (["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "APPROVED", "COMPLETE"].includes(eventType)) status = "VERIFIED";
  if (["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_PROTEST", "REFUNDED", "CHARGEBACK"].includes(eventType)) status = "REFUNDED";
  if (["PURCHASE_CANCELED", "PURCHASE_CANCELLED", "PURCHASE_EXPIRED", "CANCELED", "CANCELLED", "EXPIRED"].includes(eventType)) status = "REJECTED";
  const transaction = stringValue(purchase.transaction) || stringValue(payload.transaction);
  const eventId = payload.id == null ? `${eventType}:${transaction || fallbackEventId}` : String(payload.id);
  const approvedDate = typeof purchase.approved_date === "number"
    ? new Date(purchase.approved_date).toISOString()
    : stringValue(purchase.approved_date) && Number.isFinite(new Date(String(purchase.approved_date)).getTime())
      ? new Date(String(purchase.approved_date)).toISOString()
      : null;

  return {
    eventId,
    eventType,
    localPaymentId: stringValue(tracking.source_sck) || stringValue(purchase.sck),
    providerReference: transaction,
    externalItemId: product.id == null ? null : String(product.id),
    status,
    payerName: stringValue(buyer.name),
    payerEmail: stringValue(buyer.email),
    payerPhone: stringValue(buyer.checkout_phone) || stringValue(buyer.phone),
    amountCents: decimalToCents(price.value),
    currency: stringValue(price.currency_code),
    paidAt: status === "VERIFIED" ? approvedDate || now.toISOString() : null,
    paymentMethod: stringValue(payment.type)?.replaceAll("_", " ") || "Hotmart",
  };
}
