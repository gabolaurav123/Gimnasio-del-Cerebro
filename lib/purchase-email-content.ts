export const PURCHASE_EMAIL_RETRYABLE_PREFIX = "PURCHASE_EMAIL_RETRYABLE:";

export function isRetryablePurchaseEmailStatus(status: number) {
  return [401, 403, 408, 409, 425, 429].includes(status) || status >= 500;
}

export function purchaseEmailIdempotencyKey(paymentId: string) {
  return `purchase-confirmation/${paymentId}`;
}

export type PurchaseConfirmationInput = {
  paymentId: string;
  reference: string;
  recipient: string;
  payerName: string;
  concept: string;
  provider: "STRIPE" | "HOTMART";
  providerReference?: string | null;
  amountCents: number;
  currency: string;
  accountAccess: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] || character);
}

function formatAmount(amountCents: number, currency: string) {
  if (amountCents <= 0) return "Importe confirmado por el proveedor";
  try {
    return new Intl.NumberFormat("es-BO", { style: "currency", currency }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

export function buildPurchaseEmail(input: PurchaseConfirmationInput, siteUrl = "https://gimnasio-del-cerebro.gabolaurav2.chatgpt.site") {
  const safeName = escapeHtml(input.payerName || "Hola");
  const safeConcept = escapeHtml(input.concept);
  const safeReference = escapeHtml(input.reference);
  const safeProviderReference = input.providerReference ? escapeHtml(input.providerReference) : "";
  const amount = escapeHtml(formatAmount(input.amountCents, input.currency));
  const normalizedSite = siteUrl.replace(/\/$/, "");
  const accountBlock = input.accountAccess
    ? `<p style="margin:24px 0 0"><a href="${normalizedSite}/mi-cuenta" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#0b63ce;color:#fff;text-decoration:none;font-weight:700">Entrar a mi cuenta</a></p>`
    : `<p style="margin:22px 0 0;color:#52657d">Si el contenido incluye acceso digital, utiliza en Gimnasio del Cerebro el mismo correo con el que realizaste la compra. El equipo podrá ayudarte a vincularlo.</p>`;
  const subject = `Compra confirmada · ${input.concept}`;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#eef4fa;font-family:Arial,sans-serif;color:#0b1f3a"><div style="max-width:620px;margin:0 auto;padding:34px 18px"><div style="background:#fff;border:1px solid #dce6f1;border-radius:22px;overflow:hidden"><div style="padding:28px 30px;background:linear-gradient(135deg,#071d3a,#0b63ce);color:#fff"><p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Gimnasio del Cerebro</p><h1 style="margin:0;font-size:28px">Tu compra fue confirmada</h1></div><div style="padding:30px"><p style="margin:0 0 18px;font-size:17px">Hola ${safeName},</p><p style="margin:0 0 24px;line-height:1.65;color:#42556f">Recibimos la confirmación de tu pago. Estos son los datos registrados:</p><table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px"><tr><td style="padding:11px 0;border-bottom:1px solid #e8eef5;color:#687b92">Producto</td><td style="padding:11px 0;border-bottom:1px solid #e8eef5;text-align:right;font-weight:700">${safeConcept}</td></tr><tr><td style="padding:11px 0;border-bottom:1px solid #e8eef5;color:#687b92">Importe</td><td style="padding:11px 0;border-bottom:1px solid #e8eef5;text-align:right;font-weight:700">${amount}</td></tr><tr><td style="padding:11px 0;border-bottom:1px solid #e8eef5;color:#687b92">Proveedor</td><td style="padding:11px 0;border-bottom:1px solid #e8eef5;text-align:right;font-weight:700">${input.provider}</td></tr><tr><td style="padding:11px 0;color:#687b92">Referencia GDC</td><td style="padding:11px 0;text-align:right;font-weight:700">${safeReference}</td></tr>${safeProviderReference ? `<tr><td style="padding:11px 0;color:#687b92">Referencia de pago</td><td style="padding:11px 0;text-align:right;font-weight:700">${safeProviderReference}</td></tr>` : ""}</table>${accountBlock}<p style="margin:26px 0 0;color:#718198;font-size:12px;line-height:1.6">Conserva este correo como comprobante. Nunca te solicitaremos claves ni datos completos de tu tarjeta por correo.</p></div></div></div></body></html>`;
  const text = [
    `Hola ${input.payerName || ""},`, "", "Tu compra fue confirmada.", `Producto: ${input.concept}`,
    `Importe: ${formatAmount(input.amountCents, input.currency)}`, `Proveedor: ${input.provider}`,
    `Referencia GDC: ${input.reference}`, input.providerReference ? `Referencia de pago: ${input.providerReference}` : "", "",
    input.accountAccess ? `Accede a tu cuenta: ${normalizedSite}/mi-cuenta` : "Si corresponde acceso digital, utiliza el mismo correo de la compra para vincularlo con tu cuenta.",
  ].filter(Boolean).join("\n");
  return { subject, html, text };
}
