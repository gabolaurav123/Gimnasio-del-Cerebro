"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function CheckoutButton({ itemType, itemId, provider }: { itemType: "PRODUCT" | "TRAINING"; itemId: string; provider: "STRIPE" | "HOTMART" }) {
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function start() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/customer/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType, itemId }) });
      const payload = await response.json().catch(() => ({})) as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "No se pudo iniciar el pago.");
      window.location.assign(payload.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No pudimos conectar con el pago. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }
  return <div className="checkout-action"><button className="button button--primary" type="button" onClick={start} disabled={loading}><ShieldCheck size={18} />{loading ? "Preparando pago…" : `Continuar a ${provider === "STRIPE" ? "Stripe" : "Hotmart"}`}<ExternalLink size={16} /></button>{error && <p className="form-error">{error}</p>}</div>;
}
