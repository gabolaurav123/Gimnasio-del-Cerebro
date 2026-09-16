export type StripeChargeRefund = {
  grossAmountCents: number;
  refundedAmountCents: number;
  fullRefund: boolean;
  paymentStatus: "VERIFIED" | "REFUNDED";
};

function nonNegativeInteger(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

export function classifyStripeChargeRefund(charge: Record<string, unknown>): StripeChargeRefund {
  const grossAmountCents = nonNegativeInteger(charge.amount);
  const refundedAmountCents = nonNegativeInteger(charge.amount_refunded);
  if (!grossAmountCents || !refundedAmountCents) throw new Error("Stripe no informó importes válidos para el reembolso.");
  if (refundedAmountCents > grossAmountCents) throw new Error("El reembolso de Stripe supera el importe original.");
  if (charge.refunded === true && refundedAmountCents !== grossAmountCents) throw new Error("Stripe informó un reembolso total con un importe inconsistente.");
  const fullRefund = refundedAmountCents === grossAmountCents;
  return {
    grossAmountCents,
    refundedAmountCents,
    fullRefund,
    paymentStatus: fullRefund ? "REFUNDED" : "VERIFIED",
  };
}
