export type CheckoutConfiguration = {
  checkoutProvider: string;
  checkoutUrl?: string | null;
  checkoutExternalId?: string | null;
};

export function hasOnlineCheckout(item: CheckoutConfiguration) {
  if (item.checkoutProvider !== "STRIPE" && item.checkoutProvider !== "HOTMART") return false;
  return Boolean(item.checkoutUrl?.trim())
    || (item.checkoutProvider === "STRIPE" && /^price_[A-Za-z0-9]+$/.test(item.checkoutExternalId?.trim() || ""));
}
