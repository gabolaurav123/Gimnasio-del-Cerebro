"use client";

import Image from "next/image";
import { ArrowRight, Check, Edit3, Plus, Search, Sparkles, UploadCloud, UserPlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { AdminRole, AdminUser, BlogPost, Contact, Training } from "../../db/repository";

const statusLabels: Record<string, string> = { NEW: "Nuevo", CONTACTED: "Contactado", INTERESTED: "Interesado", FOLLOW_UP: "Seguimiento", ENROLLED: "Inscrito", NOT_INTERESTED: "No interesado", CLOSED: "Cerrado", DRAFT: "Borrador", PUBLISHED: "Publicado", HIDDEN: "Oculto", ARCHIVED: "Archivado" };
export function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{statusLabels[status] ?? status}</span>; }

export function CrmTable({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("");
  const filtered = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.email} ${contact.phone}`.toLowerCase().includes(query.toLowerCase()) && (!status || contact.status === status)), [contacts, query, status]);
  return <><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Buscar por nombre, email o teléfono" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "ENROLLED", "NOT_INTERESTED", "CLOSED"].map((item) => <option value={item} key={item}>{statusLabels[item]}</option>)}</select></div>{filtered.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Persona</th><th>Contacto</th><th>Interés</th><th>Estado</th><th>Fuente</th><th>Fecha</th><th /></tr></thead><tbody>{filtered.map((contact) => <tr key={contact.id}><td><strong>{contact.name}</strong><span>{contact.country}</span></td><td><a href={`mailto:${contact.email}`}>{contact.email}</a><span>{contact.phone}</span></td><td>{contact.trainingInterest || "Por definir"}</td><td><StatusBadge status={contact.status} /></td><td>{contact.source === "website_contact" ? "Formulario web" : contact.source}</td><td>{new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(contact.createdAt))}</td><td><a className="icon-action" href={`/admin/crm/${contact.id}`} aria-label={`Abrir contacto ${contact.name}`}><ArrowRight size={17} /></a></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Search /><h3>Todavía no hay contactos con estos filtros.</h3><p>Los nuevos formularios aparecerán aquí automáticamente.</p></div>}</>;
}

export function ContactEditor({ contact }: { contact: Contact }) {
  const [saved, setSaved] = useState(false); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`/api/admin/contacts/${contact.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }); setLoading(false); setSaved(response.ok); }
  return <form className="contact-editor" onSubmit={submit}><label>Estado<select name="status" defaultValue={contact.status}>{["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "ENROLLED", "NOT_INTERESTED", "CLOSED"].map((item) => <option value={item} key={item}>{statusLabels[item]}</option>)}</select></label><label>Próximo seguimiento<input type="date" name="nextFollowUp" defaultValue={contact.nextFollowUp?.slice(0, 10) ?? ""} /></label><label>Agregar nota<textarea name="note" rows={4} placeholder="Escribe una nota interna…" /></label><button className="button button--primary" disabled={loading}>{loading ? "Guardando…" : "Guardar cambios"}</button>{saved && <p className="inline-success"><Check size={16} />Cambios guardados</p>}</form>;
}

export function ContentManager({ kind, trainings = [], posts = [] }: { kind: "trainings" | "posts"; trainings?: Training[]; posts?: BlogPost[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [notice, setNotice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const items = kind === "trainings"
    ? trainings.map((item) => ({ id: item.id, title: item.name, meta: item.acronym, status: item.status, image: item.logo, source: item }))
    : posts.map((item) => ({ id: item.id, title: item.title, meta: item.category, status: item.status, image: item.image ?? "", source: item }));
  async function changeStatus(id: string, status: string) { const response = await fetch(`/api/admin/${kind}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }); setNotice(response.ok ? "Estado actualizado correctamente." : "No se pudo actualizar."); }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (kind === "trainings") {
      const response = await fetch("/api/admin/trainings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
      if (response.ok) { setNotice("Entrenamiento creado como borrador."); form.reset(); setCreating(false); window.location.reload(); } else setNotice("Revisa los datos ingresados.");
      return;
    }
    let image = String(data.get("existingImage") ?? "");
    const file = data.get("imageFile");
    if (file instanceof File && file.size) {
      const upload = new FormData(); upload.set("file", file);
      const uploadResponse = await fetch("/api/admin/media", { method: "POST", body: upload });
      const uploaded = await uploadResponse.json() as { url?: string; error?: string };
      if (!uploadResponse.ok || !uploaded.url) { setNotice(uploaded.error ?? "No se pudo subir la imagen."); return; }
      image = uploaded.url;
    }
    const payload = { title: String(data.get("title") ?? ""), category: String(data.get("category") ?? ""), slug: String(data.get("slug") ?? ""), excerpt: String(data.get("excerpt") ?? ""), content: String(data.get("content") ?? ""), author: String(data.get("author") ?? ""), image };
    const response = await fetch(editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts", { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const responsePayload = await response.json() as { error?: string };
    if (response.ok) { setNotice(editing ? "Artículo actualizado." : "Artículo creado como borrador."); setCreating(false); setEditing(null); window.location.reload(); } else setNotice(responsePayload.error ?? "Revisa los datos ingresados.");
  }
  async function generateDraft(form: HTMLFormElement) {
    const data = new FormData(form);
    const content = form.elements.namedItem("content") as HTMLTextAreaElement;
    setAiLoading(true);
    const response = await fetch("/api/admin/ai/blog-draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: data.get("title"), category: data.get("category"), brief: data.get("aiBrief") || data.get("excerpt") }) });
    const payload = await response.json() as { draft?: string; error?: string };
    setAiLoading(false);
    if (response.ok && payload.draft) { content.value = payload.draft; setNotice("Borrador generado. Revísalo antes de publicar."); } else setNotice(payload.error ?? "No se pudo generar el borrador.");
  }
  function openNew() { setEditing(null); setCreating(true); setNotice(""); }
  function openEdit(post: BlogPost) { setEditing(post); setCreating(true); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <><div className="manager-actions"><button className="button button--primary" type="button" onClick={openNew}><Plus size={17} />{kind === "trainings" ? "Nuevo entrenamiento" : "Nuevo artículo"}</button>{notice && <span role="status">{notice}</span>}</div>{creating && <form className="manager-form" onSubmit={save} key={editing?.id ?? "new"}><div className="admin-card__heading"><div><h2>{editing ? "Editar artículo" : kind === "posts" ? "Nuevo artículo" : "Nuevo entrenamiento"}</h2><p>{kind === "posts" ? "Puedes guardar el borrador y publicarlo cuando esté revisado." : "Se creará como borrador."}</p></div></div><div className="field-row"><label>{kind === "trainings" ? "Nombre" : "Título"}<input name={kind === "trainings" ? "name" : "title"} defaultValue={editing?.title} required /></label><label>{kind === "trainings" ? "Acrónimo" : "Categoría"}<input name={kind === "trainings" ? "acronym" : "category"} defaultValue={editing?.category} required /></label></div><label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={editing?.slug} required /></label><label>{kind === "trainings" ? "Descripción corta" : "Extracto"}<textarea name={kind === "trainings" ? "shortDescription" : "excerpt"} rows={3} defaultValue={editing?.excerpt} required /></label>{kind === "posts" && <><div className="field-row"><label>Autor<input name="author" defaultValue={editing?.author ?? "Gimnasio del Cerebro"} /></label><label>Imagen principal<input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label></div><input type="hidden" name="existingImage" value={editing?.image ?? ""} />{editing?.image && <div className="post-image-preview"><Image src={editing.image} alt="Imagen actual del artículo" width={220} height={130} /></div>}<label>Guía para el asistente de OpenAI<textarea name="aiBrief" rows={3} placeholder="Indica el enfoque, las ideas principales y el tono. No se publica." /></label><button className="button button--ai" type="button" disabled={aiLoading} onClick={(event) => generateDraft(event.currentTarget.form!)}><Sparkles size={17} />{aiLoading ? "Generando…" : "Generar borrador con OpenAI"}</button><label>Contenido<textarea name="content" rows={12} defaultValue={editing?.content} required /></label></>}<div className="button-row"><button className="button button--primary">{editing ? "Guardar cambios" : "Guardar borrador"}</button><button className="button button--outline" type="button" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</button></div></form>}<div className="admin-table-wrap"><table className="admin-table content-table"><thead><tr><th>Contenido</th><th>Identificador</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="content-cell">{item.image ? <Image src={item.image} alt="" width={54} height={54} /> : <span className="content-placeholder"><Edit3 /></span>}<strong>{item.title}</strong></div></td><td>{item.meta}</td><td><select defaultValue={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>{(kind === "trainings" ? ["DRAFT", "PUBLISHED", "HIDDEN"] : ["DRAFT", "PUBLISHED", "ARCHIVED"]).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></td><td>{kind === "posts" ? <button className="icon-action" type="button" aria-label={`Editar ${item.title}`} onClick={() => openEdit(item.source as BlogPost)}><Edit3 size={17} /></button> : <span>—</span>}</td></tr>)}</tbody></table></div></>;
}

type SafeAdminUser = Omit<AdminUser, "passwordHash">;

function UserRow({ user }: { user: SafeAdminUser }) {
  const managedByEnvironment = user.id === "bootstrap-superadmin";
  const [role, setRole] = useState<AdminRole>(user.role);
  const [active, setActive] = useState(user.active);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function save() {
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role, active, password }) });
    const payload = await response.json() as { error?: string };
    setMessage(response.ok ? "Guardado" : payload.error ?? "No se pudo guardar");
    if (response.ok) setPassword("");
  }
  return <tr><td><strong>{user.email}</strong><span>{managedByEnvironment ? "Cuenta de recuperación · Seenode" : `Creado ${new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(user.createdAt))}`}</span></td><td><select value={role} disabled={managedByEnvironment} onChange={(event) => setRole(event.target.value as AdminRole)}><option value="SUPERADMIN">Superadmin</option><option value="EDITOR">Editor</option><option value="COMERCIAL">Comercial</option></select></td><td><label className="user-active"><input type="checkbox" checked={active} disabled={managedByEnvironment} onChange={(event) => setActive(event.target.checked)} />{active ? "Activo" : "Inactivo"}</label></td><td><input aria-label={`Nueva contraseña para ${user.email}`} type="password" minLength={12} disabled={managedByEnvironment} placeholder={managedByEnvironment ? "Gestionada en Seenode" : "Nueva contraseña (opcional)"} value={password} onChange={(event) => setPassword(event.target.value)} /></td><td>{managedByEnvironment ? <small>Protegida por configuración</small> : <><button className="button button--small button--primary" type="button" onClick={save}>Guardar</button>{message && <small>{message}</small>}</>}</td></tr>;
}

export function UserManager({ users }: { users: SafeAdminUser[] }) {
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const payload = await response.json() as { error?: string };
    if (response.ok) { setMessage("Usuario creado."); window.location.reload(); } else setMessage(payload.error ?? "No se pudo crear el usuario.");
  }
  return <><div className="manager-actions"><button className="button button--primary" type="button" onClick={() => setCreating((value) => !value)}><UserPlus size={17} />Nuevo usuario</button>{message && <span role="status">{message}</span>}</div>{creating && <form className="manager-form user-create-form" onSubmit={create}><div className="field-row"><label>Email<input name="email" type="email" required /></label><label>Rol<select name="role" defaultValue="EDITOR"><option value="SUPERADMIN">Superadmin</option><option value="EDITOR">Editor</option><option value="COMERCIAL">Comercial</option></select></label></div><label>Contraseña temporal<input name="password" type="password" minLength={12} required /><small>Mínimo 12 caracteres. Compártela de forma privada.</small></label><div className="button-row"><button className="button button--primary">Crear usuario</button><button className="button button--outline" type="button" onClick={() => setCreating(false)}>Cancelar</button></div></form>}<div className="admin-table-wrap"><table className="admin-table user-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Contraseña</th><th>Acciones</th></tr></thead><tbody>{users.map((user) => <UserRow user={user} key={user.id} />)}</tbody></table></div></>;
}

export function MediaUpload() {
  const [message, setMessage] = useState(""); async function upload(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const response = await fetch("/api/admin/media", { method: "POST", body: new FormData(event.currentTarget) }); const payload = await response.json() as { error?: string; name?: string }; setMessage(response.ok ? `${payload.name} se subió correctamente.` : payload.error ?? "No se pudo subir el archivo."); }
  return <form className="media-upload" onSubmit={upload}><UploadCloud /><h3>Subir recurso visual</h3><p>PNG, JPEG, WebP o AVIF. Máximo 8 MB.</p><input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif" required /><button className="button button--primary">Subir archivo</button>{message && <span>{message}</span>}</form>;
}
