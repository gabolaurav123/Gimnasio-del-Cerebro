"use client";

import { Gift, Search, UserRoundCheck, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Customer = { id: string; name: string; email: string; phone: string | null; country: string | null; active: boolean; accessCount: number; createdAt: string };
type CatalogItem = { itemType: "PRODUCT" | "TRAINING"; itemId: string; name: string; category: string };
type Assignment = { id: string; customerId: string; itemType: "PRODUCT" | "TRAINING"; itemId: string };

export function CustomerManager({ customers, catalog, initialAssignments }: { customers: Customer[]; catalog: CatalogItem[]; initialAssignments: Assignment[] }) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [saving, setSaving] = useState("");
  const filtered = useMemo(() => customers.filter((item) => `${item.name} ${item.email} ${item.phone || ""}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);

  async function toggle(id: string, active: boolean) {
    const response = await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active }) });
    if (!response.ok) setNotice("No se pudo cambiar el acceso a la cuenta."); else window.location.reload();
  }

  async function updateEntitlement(customerId: string, itemType: "PRODUCT" | "TRAINING", itemId: string, active: boolean) {
    const operation = `${customerId}:${itemType}:${itemId}`;
    setSaving(operation); setNotice("");
    const response = await fetch(`/api/admin/customers/${customerId}/entitlements`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType, itemId, active }) });
    const payload = await response.json() as { entitlementId?: string; error?: string };
    setSaving("");
    if (!response.ok) { setNotice(payload.error || "No se pudo actualizar el acceso."); return; }
    if (active) setAssignments((items) => [...items.filter((item) => !(item.customerId === customerId && item.itemType === itemType && item.itemId === itemId)), { id: payload.entitlementId || operation, customerId, itemType, itemId }]);
    else setAssignments((items) => items.filter((item) => !(item.customerId === customerId && item.itemType === itemType && item.itemId === itemId)));
    setNotice(active ? "Contenido asignado correctamente." : "Acceso retirado correctamente.");
  }

  async function grant(event: FormEvent<HTMLFormElement>, customerId: string) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("catalogItem") || "");
    const [itemType, itemId] = value.split(":") as ["PRODUCT" | "TRAINING", string];
    if (!itemId) { setNotice("Selecciona un contenido para asignar."); return; }
    await updateEntitlement(customerId, itemType, itemId, true);
    event.currentTarget.reset();
  }

  return <><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Buscar usuario por nombre o correo" value={query} onChange={(event) => setQuery(event.target.value)} /></label>{notice && <span className="admin-inline-notice">{notice}</span>}</div><div className="admin-table-wrap"><table className="admin-table admin-table--customers"><thead><tr><th>Usuario</th><th>Contacto</th><th>Accesos y regalos</th><th>Registro</th><th>Estado</th></tr></thead><tbody>{filtered.map((customer) => { const activeAssignments = assignments.filter((item) => item.customerId === customer.id); const available = catalog.filter((item) => !activeAssignments.some((assignment) => assignment.itemType === item.itemType && assignment.itemId === item.itemId)); return <tr key={customer.id}><td><strong>{customer.name}</strong><span>{customer.email}</span></td><td><span>{customer.phone || "Sin teléfono"}</span><span>{customer.country || "País no indicado"}</span></td><td><details className="customer-access"><summary><Gift size={15} />{activeAssignments.length} {activeAssignments.length === 1 ? "acceso activo" : "accesos activos"}</summary><div className="customer-access__panel"><div className="customer-access__chips">{activeAssignments.length ? activeAssignments.map((assignment) => { const item = catalog.find((entry) => entry.itemType === assignment.itemType && entry.itemId === assignment.itemId); const operation = `${customer.id}:${assignment.itemType}:${assignment.itemId}`; return <span key={assignment.id}>{item?.name || "Contenido"}<button type="button" disabled={saving === operation} onClick={() => void updateEntitlement(customer.id, assignment.itemType, assignment.itemId, false)} aria-label={`Quitar ${item?.name || "contenido"}`}><X size={13} /></button></span>; }) : <small>Este usuario todavía no tiene contenidos asignados.</small>}</div><form onSubmit={(event) => void grant(event, customer.id)}><select name="catalogItem" defaultValue="" required><option value="">Seleccionar contenido…</option>{available.map((item) => <option value={`${item.itemType}:${item.itemId}`} key={`${item.itemType}:${item.itemId}`}>{item.category} · {item.name}</option>)}</select><button className="button button--primary button--small" disabled={Boolean(saving) || !available.length}><Gift size={15} />Asignar / regalar</button></form></div></details></td><td>{new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(new Date(customer.createdAt))}</td><td><button className={`button ${customer.active ? "button--outline" : "button--primary"}`} type="button" onClick={() => void toggle(customer.id, !customer.active)}>{customer.active ? "Suspender" : "Reactivar"}</button></td></tr>; })}</tbody></table>{!filtered.length && <div className="admin-empty"><UserRoundCheck /><h3>No hay usuarios con ese criterio.</h3></div>}</div></>;
}
