"use client";

import { Search, UserRoundCheck } from "lucide-react";
import { useMemo, useState } from "react";

type Customer = { id: string; name: string; email: string; phone: string | null; country: string | null; active: boolean; accessCount: number; createdAt: string };
export function CustomerManager({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState(""); const [notice, setNotice] = useState("");
  const filtered = useMemo(() => customers.filter((item) => `${item.name} ${item.email} ${item.phone || ""}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  async function toggle(id: string, active: boolean) { const response = await fetch(`/api/admin/customers/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active }) }); if (!response.ok) setNotice("No se pudo cambiar el acceso."); else window.location.reload(); }
  return <><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Buscar usuario por nombre o correo" value={query} onChange={(event) => setQuery(event.target.value)} /></label>{notice && <span className="form-error">{notice}</span>}</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuario</th><th>Contacto</th><th>Accesos</th><th>Registro</th><th>Estado</th></tr></thead><tbody>{filtered.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong><span>{customer.email}</span></td><td><span>{customer.phone || "Sin teléfono"}</span><span>{customer.country || "País no indicado"}</span></td><td><strong>{customer.accessCount}</strong><span>programas activos</span></td><td>{new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(new Date(customer.createdAt))}</td><td><button className={`button ${customer.active ? "button--outline" : "button--primary"}`} type="button" onClick={() => void toggle(customer.id, !customer.active)}>{customer.active ? "Suspender" : "Reactivar"}</button></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-empty"><UserRoundCheck /><h3>No hay usuarios con ese criterio.</h3></div>}</div></>;
}
