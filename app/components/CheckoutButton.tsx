"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function CheckoutButton({ itemType, itemId, provider }: { itemType: "PRODUCT" | "TRAINING"; itemId: string; provider: "STRIPE" | "HOTMART" }) {
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function start() {
    setLoading(true); setError("");
    const response = await fetch("/api/customer/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType, itemId }) });
    const payload = await response.json() as { url?: string; error?: string };
    if (!response.ok || !payload.url) { setError(payload.error || "No se pudo iniciar el pago."); setLoading(false); return; }
    window.location.assign(payload.url);
  }
  return <div className="checkout-action"><button className="button button--primary" type="button" onClick={start} disabled={loading}><ShieldCheck size={18} />{loading ? "Preparando pago…" : `Continuar a ${provider === "STRIPE" ? "Stripe" : "Hotmart"}`}<ExternalLink size={16} /></button>{error && <p className="form-error">{error}</p>}</div>;
}
