import { getRuntimeValues } from "./runtime-env";
import {
  buildPurchaseEmail,
  isRetryablePurchaseEmailStatus,
  purchaseEmailIdempotencyKey,
  PURCHASE_EMAIL_RETRYABLE_PREFIX,
  type PurchaseConfirmationInput,
} from "./purchase-email-content";

export {
  buildPurchaseEmail,
  isRetryablePurchaseEmailStatus,
  purchaseEmailIdempotencyKey,
  PURCHASE_EMAIL_RETRYABLE_PREFIX,
  type PurchaseConfirmationInput,
};

export async function sendPurchaseConfirmation(input: PurchaseConfirmationInput, fetcher: typeof fetch = fetch) {
  const runtime = await getRuntimeValues([
    "PURCHASE_EMAIL_ENABLED",
    "RESEND_API_KEY",
    "PURCHASE_EMAIL_FROM",
    "PURCHASE_EMAIL_REPLY_TO",
    "SITE_URL",
  ]);
  const enabled = /^(1|true|yes|on)$/i.test(runtime.PURCHASE_EMAIL_ENABLED?.trim() || "");
  const apiKey = runtime.RESEND_API_KEY?.trim() || "";
  const from = runtime.PURCHASE_EMAIL_FROM?.trim() || "";
  if (!enabled || !apiKey || !from || !input.recipient.trim()) {
    return { status: "skipped" as const, reason: !enabled ? "disabled" : "unconfigured" };
  }

  const email = buildPurchaseEmail(input, runtime.SITE_URL?.trim());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const response = await fetcher("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "idempotency-key": purchaseEmailIdempotencyKey(input.paymentId),
      },
      body: JSON.stringify({
        from,
        to: [input.recipient.trim().toLowerCase()],
        reply_to: runtime.PURCHASE_EMAIL_REPLY_TO?.trim() || undefined,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (response.ok) return { status: "sent" as const, messageId: payload.id || null };
    const reason = payload.message || `Resend respondió HTTP ${response.status}`;
    if (isRetryablePurchaseEmailStatus(response.status)) throw new Error(`${PURCHASE_EMAIL_RETRYABLE_PREFIX}${reason}`);
    return { status: "failed" as const, reason };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(PURCHASE_EMAIL_RETRYABLE_PREFIX)) throw error;
    const reason = error instanceof Error ? error.message : "Error de red al enviar el correo";
    throw new Error(`${PURCHASE_EMAIL_RETRYABLE_PREFIX}${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}
