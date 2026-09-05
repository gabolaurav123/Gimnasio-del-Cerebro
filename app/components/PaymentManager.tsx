"use client";

import { CheckCircle2, CircleDollarSign, Plus, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { Payment } from "../../db/repository";
import { StatusBadge } from "./AdminUI";

type Summary = { pending: number; verified: number; exceptions: number; totals: { currency: string; amountCents: number }[] };

const methodLabels: Record<string, string> = { BANK_TRANSFER: "Transferencia", QR: "QR", CASH: "Efectivo", CARD: "Tarjeta", OTHER: "Otro" };
const statusLabels: Record<string, string> = { PENDING: "Pendiente", VERIFIED: "Verificado", REJECTED: "Rechazado", REFUNDED: "Reembolsado" };

function amount(value: number, currency: string) {
  if (value <= 0) return "Por confirmar";
  return new Intl.NumberFormat("es-BO", { style: "currency", currency, minimumFractionDigits: 2 }).format(value / 100);
}

export function PaymentManager({ payments, summary }: { payments: Payment[]; summary: Summary }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => payments.filter((payment) => {
    const haystack = `${payment.reference} ${payment.payerName} ${payment.payerEmail ?? ""} ${payment.payerPhone ?? ""} ${payment.concept} ${payment.providerReference ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (!status || payment.status === status);
  }), [payments, query, status]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/payments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json() as { error?: string; reference?: string };
    if (!response.ok) { setNotice(payload.error || "No se pudo registrar el pago."); return; }
    setNotice(`Pago ${payload.reference} registrado como pendiente.`);
    setCreating(false);
    window.location.reload();
  }

  async function changeStatus(id: string, nextStatus: string) {
    const response = await fetch(`/api/admin/payments/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    setNotice(response.ok ? "Estado del pago actualizado." : "No se pudo actualizar el pago.");
    if (response.ok) window.location.reload();
  }

  const verifiedTotal = summary.totals.length ? summary.totals.map((item) => amount(item.amountCents, item.currency)).join(" · ") : "Sin cobros verificados";
  return <>
    <div className="payment-summary">
      <article><CircleDollarSign /><div><span>Total verificado</span><strong>{verifiedTotal}</strong></div></article>
      <article><ShieldCheck /><div><span>Pagos verificados</span><strong>{summary.verified}</strong></div></article>
      <article><TriangleAlert /><div><span>Pendientes</span><strong>{summary.pending}</strong></div></article>
      <article><CheckCircle2 /><div><span>Rechazados / reembolsados</span><strong>{summary.exceptions}</strong></div></article>
    </div>
    <section className="admin-card admin-card--flush">
      <div className="manager-actions"><button className="button button--primary" type="button" onClick={() => setCreating((value) => !value)}><Plus size={17} />Registrar pago</button>{notice && <span role="status">{notice}</span>}</div>
      {creating && <form className="manager-form payment-form" onSubmit={create}>
        <div className="admin-card__heading"><div><h2>Nuevo pago</h2><p>Registro manual preparado para transferencias, QR, tarjetas y futuras integraciones.</p></div></div>
        <div className="field-row"><label>Nombre del pagador<input name="payerName" required maxLength={150} /></label><label>Concepto<input name="concept" placeholder="BioShield, entrenamiento, evento…" required maxLength={180} /></label></div>
        <div className="field-row"><label>Email<input name="payerEmail" type="email" maxLength={200} /></label><label>WhatsApp / teléfono<input name="payerPhone" maxLength={40} /></label></div>
        <div className="field-row"><label>Tipo<select name="itemType" defaultValue="PRODUCT"><option value="PRODUCT">Producto</option><option value="TRAINING">Entrenamiento</option><option value="EVENT">Evento</option><option value="OTHER">Otro</option></select></label><label>Identificador interno (opcional)<input name="itemId" maxLength={120} placeholder="Slug o ID" /></label></div>
        <div className="field-row field-row--three"><label>Monto<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Moneda<select name="currency" defaultValue="BOB"><option value="BOB">BOB</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label><label>Método<select name="paymentMethod" defaultValue="QR"><option value="QR">QR</option><option value="BANK_TRANSFER">Transferencia</option><option value="CARD">Tarjeta</option><option value="CASH">Efectivo</option><option value="OTHER">Otro</option></select></label></div>
        <div className="field-row"><label>Referencia del proveedor<input name="providerReference" maxLength={180} placeholder="Código de operación" /></label><label>Fecha del pago<input name="paidAt" type="datetime-local" /></label></div>
        <label>Notas internas<textarea name="notes" rows={3} maxLength={1500} /></label>
        <div className="button-row"><button className="button button--primary">Guardar pago</button><button className="button button--outline" type="button" onClick={() => setCreating(false)}>Cancelar</button></div>
      </form>}
      <div className="admin-toolbar"><label><Search size={17} /><input placeholder="Buscar por persona, referencia o concepto" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
      {filtered.length ? <div className="admin-table-wrap"><table className="admin-table payment-table"><thead><tr><th>Referencia</th><th>Pagador</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{filtered.map((payment) => <tr key={payment.id}><td><strong>{payment.reference}</strong><span>{payment.providerReference || "Sin referencia externa"}</span></td><td><strong>{payment.payerName}</strong><span>{payment.payerEmail || payment.payerPhone || "Sin contacto"}</span></td><td><strong>{payment.concept}</strong><span>{payment.itemType}</span></td><td><strong>{amount(payment.amountCents, payment.currency)}</strong><span>{payment.currency}</span></td><td>{methodLabels[payment.paymentMethod] || payment.paymentMethod}</td><td>{new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.paidAt || payment.createdAt))}</td><td><select value={payment.status} onChange={(event) => changeStatus(payment.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><StatusBadge status={payment.status} />{payment.verifiedBy && <span>Por {payment.verifiedBy}</span>}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><CircleDollarSign /><h3>Todavía no hay pagos con estos filtros.</h3><p>Los registros manuales y los futuros pagos integrados aparecerán aquí.</p></div>}
    </section>
  </>;
}
