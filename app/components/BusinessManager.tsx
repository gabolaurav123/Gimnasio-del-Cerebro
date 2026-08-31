"use client";

import { CalendarDays, CalendarOff, Check, Edit3, ImageIcon, Plus, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { Appointment, Associate, EventItem, Product } from "../../db/repository";
import type { AppointmentBlock } from "../../db/scheduling";
import { StatusBadge } from "./AdminUI";

type Kind = "products" | "events" | "associates";
type CatalogItem = Product | EventItem | Associate;

const labels = {
  products: { singular: "producto", plural: "Productos" },
  events: { singular: "evento", plural: "Eventos" },
  associates: { singular: "asociado", plural: "Asociados" },
};

function titleOf(item: CatalogItem) { return "title" in item ? item.title : item.name; }
function imageOf(item: CatalogItem) { return item.image || ""; }

export function BusinessManager({ kind, items }: { kind: Kind; items: CatalogItem[] }) {
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const product = kind === "products" ? editing as Product | null : null;
  const eventItem = kind === "events" ? editing as EventItem | null : null;
  const associate = kind === "associates" ? editing as Associate | null : null;
  async function upload(value: FormDataEntryValue | null) {
    if (!(value instanceof File) || !value.size) return "";
    const data = new FormData(); data.set("file", value);
    const response = await fetch("/api/admin/media", { method: "POST", body: data });
    const payload = await response.json() as { url?: string; error?: string };
    if (!response.ok || !payload.url) throw new Error(payload.error || "No se pudo subir la imagen.");
    return payload.url;
  }
  async function save(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault(); const form = new FormData(submitEvent.currentTarget);
    try {
      const image = await upload(form.get("imageFile")) || String(form.get("existingImage") || "");
      const common = { image, displayOrder: form.get("displayOrder") };
      const payload = kind === "products"
        ? { ...common, name: form.get("name"), slug: form.get("slug"), description: form.get("description"), priceLabel: form.get("priceLabel"), discountLabel: form.get("discountLabel"), dashboardContent: form.get("dashboardContent"), resourceUrl: form.get("resourceUrl"), checkoutProvider: form.get("checkoutProvider"), checkoutUrl: form.get("checkoutUrl"), priceCents: Math.round(Number(form.get("price") || 0) * 100), currency: form.get("currency") }
        : kind === "events"
          ? { ...common, title: form.get("title"), slug: form.get("slug"), description: form.get("description"), startsAt: form.get("startsAt"), location: form.get("location"), registrationUrl: form.get("registrationUrl") }
          : { ...common, name: form.get("name"), url: form.get("url"), description: form.get("description") };
      const response = await fetch(editing ? `/api/admin/catalog/${kind}/${editing.id}` : `/api/admin/catalog/${kind}`, { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
      setNotice(`${labels[kind].singular[0].toUpperCase()}${labels[kind].singular.slice(1)} ${editing ? "actualizado" : "creado como borrador"}.`);
      setCreating(false); setEditing(null); window.location.reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar."); }
  }
  async function changeStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/catalog/${kind}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    setNotice(response.ok ? "Estado actualizado." : "No se pudo actualizar el estado.");
  }
  function edit(item: CatalogItem) { setEditing(item); setCreating(true); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <><div className="manager-actions"><button className="button button--primary" type="button" onClick={() => { setEditing(null); setCreating(true); setNotice(""); }}><Plus size={17} />Nuevo {labels[kind].singular}</button>{notice && <span role="status">{notice}</span>}</div>
    {creating && <form className="manager-form" onSubmit={save} key={editing?.id || "new"}><div className="admin-card__heading"><div><h2>{editing ? `Editar ${labels[kind].singular}` : `Nuevo ${labels[kind].singular}`}</h2><p>Los borradores no se muestran en la web hasta que cambies su estado a Publicado.</p></div></div>
      {kind === "products" && <><div className="field-row"><label>Nombre<input name="name" defaultValue={product?.name} required /></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={product?.slug} required /></label></div><label>Descripción<textarea name="description" rows={5} defaultValue={product?.description} required /></label><label>Contenido para el panel del comprador<textarea name="dashboardContent" rows={5} defaultValue={product?.dashboardContent || ""} placeholder="Bienvenida, instrucciones y próximos pasos." /></label><div className="field-row"><label>Precio o texto comercial<input name="priceLabel" defaultValue={product?.priceLabel || "Consultar"} required /></label><label>Descuento / novedad<input name="discountLabel" defaultValue={product?.discountLabel || ""} placeholder="Ej. 20% de descuento" /><small>Si lo completas y publicas, aparecerá en la campana.</small></label></div><div className="field-row"><label>Precio numérico<input name="price" type="number" min="0" step="0.01" defaultValue={(product?.priceCents || 0) / 100} required /></label><label>Moneda<select name="currency" defaultValue={product?.currency || "BOB"}><option>BOB</option><option>USD</option><option>EUR</option></select></label></div><div className="field-row"><label>Método de pago<select name="checkoutProvider" defaultValue={product?.checkoutProvider || "MANUAL"}><option value="MANUAL">Coordinación manual</option><option value="STRIPE">Stripe Payment Link</option><option value="HOTMART">Hotmart</option></select></label><label>Enlace seguro de pago<input name="checkoutUrl" type="url" defaultValue={product?.checkoutUrl || ""} placeholder="https://buy.stripe.com/... o https://pay.hotmart.com/..." /></label></div><label>Enlace de recursos (opcional)<input name="resourceUrl" type="url" defaultValue={product?.resourceUrl || ""} placeholder="https://..." /></label></>}
      {kind === "events" && <><div className="field-row"><label>Título<input name="title" defaultValue={eventItem?.title} required /></label><label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={eventItem?.slug} required /></label></div><label>Descripción<textarea name="description" rows={5} defaultValue={eventItem?.description} required /></label><div className="field-row"><label>Fecha y hora<input name="startsAt" type="datetime-local" defaultValue={eventItem?.startsAt.slice(0, 16)} required /></label><label>Lugar o modalidad<input name="location" defaultValue={eventItem?.location} placeholder="Online / La Paz" required /></label></div><label>Enlace de registro (opcional)<input name="registrationUrl" type="url" defaultValue={eventItem?.registrationUrl || ""} placeholder="https://..." /></label></>}
      {kind === "associates" && <><div className="field-row"><label>Nombre<input name="name" defaultValue={associate?.name} required /></label><label>Sitio oficial<input name="url" type="url" defaultValue={associate?.url} placeholder="https://..." required /></label></div><label>Descripción<textarea name="description" rows={5} defaultValue={associate?.description} required /></label></>}
      <div className="field-row"><label>Imagen<input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label><label>Orden<input name="displayOrder" type="number" min={0} max={999} defaultValue={editing?.displayOrder ?? items.length + 1} required /></label></div><input type="hidden" name="existingImage" value={editing ? imageOf(editing) : ""} />
      <div className="button-row"><button className="button button--primary">Guardar</button><button className="button button--outline" type="button" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</button></div></form>}
    <div className="admin-table-wrap"><table className="admin-table content-table"><thead><tr><th>{labels[kind].plural}</th><th>Detalle</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="content-cell">{imageOf(item) ? <img src={imageOf(item)} alt="" width={54} height={54} /> : <span className="content-placeholder"><ImageIcon /></span>}<strong>{titleOf(item)}</strong></div></td><td>{"priceLabel" in item ? item.priceLabel : "startsAt" in item ? new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.startsAt)) : item.url}</td><td><select defaultValue={item.status} onChange={(e) => changeStatus(item.id, e.target.value)}><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="HIDDEN">Oculto</option></select></td><td><button className="icon-action" type="button" aria-label={`Editar ${titleOf(item)}`} onClick={() => edit(item)}><Edit3 size={17} /></button></td></tr>)}</tbody></table>{!items.length && <div className="admin-empty"><Search /><h3>Todavía no hay contenido.</h3><p>Crea el primer {labels[kind].singular} desde el botón superior.</p></div>}</div></>;
}

const appointmentLabels: Record<string, string> = { PENDING: "Pendiente", CONFIRMED: "Confirmada", COMPLETED: "Completada", CANCELLED: "Cancelada" };

export function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  const [query, setQuery] = useState(""); const [notice, setNotice] = useState("");
  const filtered = useMemo(() => appointments.filter((item) => `${item.name} ${item.email} ${item.phone} ${item.trainingInterest} ${item.appointmentType}`.toLowerCase().includes(query.toLowerCase())), [appointments, query]);
  async function change(id: string, status: string) { const response = await fetch(`/api/admin/appointments/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }); setNotice(response.ok ? "Estado de la cita actualizado." : "No se pudo actualizar."); }
  return <><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Buscar cita por nombre, email o teléfono" value={query} onChange={(e) => setQuery(e.target.value)} /></label>{notice && <span className="inline-success"><Check size={15} />{notice}</span>}</div>{filtered.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Persona</th><th>Fecha solicitada</th><th>Tipo, interés y mensaje</th><th>Estado</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email}</a><span>{item.phone} · {item.country}</span></td><td><strong>{new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(new Date(`${item.preferredDate}T12:00:00`))}</strong><span>{item.preferredTime}</span></td><td><strong>{item.appointmentType === "TRAINING" ? "Cita de entrenamiento" : "Sesión personalizada de consulta"}</strong><span>{item.trainingInterest || "Aún sin entrenamiento definido"}</span><span>{item.message || "Sin mensaje adicional"}</span></td><td><select defaultValue={item.status} onChange={(e) => change(item.id, e.target.value)}>{Object.entries(appointmentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <div className="admin-empty"><CalendarDays /><h3>Todavía no hay citas pendientes.</h3><p>Las solicitudes de “Agenda tu cita” aparecerán aquí automáticamente.</p></div>}</>;
}

export function AppointmentBlockManager({ blocks }: { blocks: AppointmentBlock[] }) {
  const [notice, setNotice] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    const response = await fetch("/api/admin/appointments/blocks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setNotice(payload.error || "No se pudo bloquear el horario."); return; }
    window.location.reload();
  }
  async function toggle(id: string, active: boolean) {
    const response = await fetch(`/api/admin/appointments/blocks/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ active }) });
    if (!response.ok) { setNotice("No se pudo cambiar el bloqueo."); return; }
    window.location.reload();
  }
  return <div className="schedule-manager"><form className="manager-form manager-form--embedded" onSubmit={create}><div className="field-row field-row--three"><label>Fecha<input name="date" type="date" required /></label><label>Desde<input name="startTime" type="time" required /></label><label>Hasta<input name="endTime" type="time" required /></label></div><div className="field-row"><label>Aplicar a<select name="appointmentType" defaultValue="ALL"><option value="ALL">Todas las citas</option><option value="CONSULTATION">Solo consultas</option><option value="TRAINING">Solo entrenamientos</option></select></label><label>Motivo<input name="reason" defaultValue="Horario no disponible" maxLength={180} required /></label></div>{notice && <p className="form-error">{notice}</p>}<button className="button button--primary"><CalendarOff size={17} />Bloquear turno</button></form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Fecha y rango</th><th>Tipo</th><th>Motivo</th><th>Disponibilidad</th></tr></thead><tbody>{blocks.map((block) => <tr key={block.id}><td><strong>{block.date}</strong><span>{block.startTime} – {block.endTime}</span></td><td>{block.appointmentType === "ALL" ? "Todas" : block.appointmentType === "TRAINING" ? "Entrenamientos" : "Consultas"}</td><td>{block.reason}</td><td><button className={`button ${block.active ? "button--outline" : "button--primary"}`} type="button" onClick={() => void toggle(block.id, !block.active)}>{block.active ? "Activar horario" : "Bloquear horario"}</button></td></tr>)}</tbody></table>{!blocks.length && <div className="admin-empty"><CalendarOff /><h3>No hay turnos bloqueados.</h3><p>Agrega cierres, descansos o fechas sin atención.</p></div>}</div></div>;
}
