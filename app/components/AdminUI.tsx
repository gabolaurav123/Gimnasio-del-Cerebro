"use client";

import Image from "next/image";
import { ArrowRight, Check, Edit3, Plus, Search, Sparkles, UploadCloud, UserPlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { AdminRole, AdminUser, BlogPost, Contact, Training } from "../../db/repository";

const statusLabels: Record<string, string> = { NEW: "Nuevo", CONTACTED: "Contactado", INTERESTED: "Interesado", FOLLOW_UP: "Seguimiento", ENROLLED: "Inscrito", NOT_INTERESTED: "No interesado", CLOSED: "Cerrado", DRAFT: "Borrador", PUBLISHED: "Publicado", HIDDEN: "Oculto", ARCHIVED: "Archivado", PENDING: "Pendiente", VERIFIED: "Verificado", REJECTED: "Rechazado", REFUNDED: "Reembolsado", CONFIRMED: "Confirmada", COMPLETED: "Completada", CANCELLED: "Cancelada" };
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
  const [editing, setEditing] = useState<Training | BlogPost | null>(null);
  const [notice, setNotice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const items = kind === "trainings"
    ? trainings.map((item) => ({ id: item.id, title: item.name, meta: item.acronym, status: item.status, image: item.logo, resource: item.resourceUrl, source: item }))
    : posts.map((item) => ({ id: item.id, title: item.title, meta: item.category, status: item.status, image: item.image ?? "", resource: item.attachmentUrl, source: item }));
  const trainingEdit = kind === "trainings" ? editing as Training | null : null;
  const postEdit = kind === "posts" ? editing as BlogPost | null : null;
  async function changeStatus(id: string, status: string) { const response = await fetch(`/api/admin/${kind}/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }); setNotice(response.ok ? "Estado actualizado correctamente." : "No se pudo actualizar."); }
  async function uploadFile(value: FormDataEntryValue | null) {
    if (!(value instanceof File) || !value.size) return "";
    const upload = new FormData(); upload.set("file", value);
    const response = await fetch("/api/admin/media", { method: "POST", body: upload });
    const payload = await response.json() as { url?: string; error?: string };
    if (!response.ok || !payload.url) throw new Error(payload.error || "No se pudo subir el archivo.");
    return payload.url;
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      if (kind === "trainings") {
        const uploadedLogo = await uploadFile(data.get("imageFile"));
        const uploadedHero = await uploadFile(data.get("heroImageFile"));
        const uploadedResource = await uploadFile(data.get("resourceFile"));
        const payload = { name: data.get("name"), acronym: data.get("acronym"), slug: data.get("slug"), shortDescription: data.get("shortDescription"), fullDescription: data.get("fullDescription"), displayOrder: data.get("displayOrder"), logo: uploadedLogo || data.get("existingLogo") || "/logos/gdc-full-v2.jpg", heroImage: uploadedHero || data.get("existingHeroImage") || "", resourceUrl: uploadedResource || data.get("existingResourceUrl") || "" };
        const response = await fetch(trainingEdit ? `/api/admin/trainings/${trainingEdit.id}` : "/api/admin/trainings", { method: trainingEdit ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        const responsePayload = await response.json() as { error?: string };
        if (!response.ok) throw new Error(responsePayload.error || "Revisa los datos ingresados.");
        setNotice(trainingEdit ? "Entrenamiento actualizado." : "Entrenamiento creado como borrador.");
      } else {
        const uploadedImage = await uploadFile(data.get("imageFile"));
        const uploadedAttachment = await uploadFile(data.get("attachmentFile"));
        const payload = { title: data.get("title"), category: data.get("category"), slug: data.get("slug"), excerpt: data.get("excerpt"), content: data.get("content"), author: data.get("author"), image: uploadedImage || data.get("existingImage") || "", attachmentUrl: uploadedAttachment || data.get("existingAttachmentUrl") || "" };
        const response = await fetch(postEdit ? `/api/admin/posts/${postEdit.id}` : "/api/admin/posts", { method: postEdit ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
        const responsePayload = await response.json() as { error?: string };
        if (!response.ok) throw new Error(responsePayload.error || "Revisa los datos ingresados.");
        setNotice(postEdit ? "Artículo actualizado." : "Artículo creado como borrador.");
      }
      setCreating(false); setEditing(null); window.location.reload();
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar."); }
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
  function openEdit(item: Training | BlogPost) { setEditing(item); setCreating(true); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <><div className="manager-actions"><button className="button button--primary" type="button" onClick={openNew}><Plus size={17} />{kind === "trainings" ? "Nuevo entrenamiento" : "Nuevo artículo"}</button>{notice && <span role="status">{notice}</span>}</div>
    {creating && <form className="manager-form" onSubmit={save} key={editing?.id ?? "new"}><div className="admin-card__heading"><div><h2>{editing ? `Editar ${kind === "trainings" ? "entrenamiento" : "artículo"}` : kind === "posts" ? "Nuevo artículo" : "Nuevo entrenamiento"}</h2><p>Guarda cambios, adjunta recursos y controla la publicación desde la tabla.</p></div></div>
      {kind === "trainings" ? <>
        <div className="field-row"><label>Nombre<input name="name" defaultValue={trainingEdit?.name} required /></label><label>Acrónimo<input name="acronym" defaultValue={trainingEdit?.acronym} required /></label></div>
        <div className="field-row"><label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={trainingEdit?.slug} required /></label><label>Orden<input name="displayOrder" type="number" min={0} max={999} defaultValue={trainingEdit?.displayOrder ?? trainings.length + 1} required /></label></div>
        <label>Descripción corta<textarea name="shortDescription" rows={3} defaultValue={trainingEdit?.shortDescription} required /></label><label>Descripción completa<textarea name="fullDescription" rows={9} defaultValue={trainingEdit?.fullDescription} required /></label>
        <div className="field-row"><label>Imagen o logo<input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label><label>Imagen de portada<input name="heroImageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label></div>
        <label>PDF o material descargable<input name="resourceFile" type="file" accept="application/pdf" /></label>
        <input type="hidden" name="existingLogo" value={trainingEdit?.logo || ""} /><input type="hidden" name="existingHeroImage" value={trainingEdit?.heroImage || ""} /><input type="hidden" name="existingResourceUrl" value={trainingEdit?.resourceUrl || ""} />
        {trainingEdit && <div className="resource-preview">{trainingEdit.logo && <Image src={trainingEdit.logo} alt="Imagen actual" width={160} height={100} />}{trainingEdit.resourceUrl && <a href={trainingEdit.resourceUrl} target="_blank" rel="noreferrer">Ver PDF actual</a>}</div>}
      </> : <>
        <div className="field-row"><label>Título<input name="title" defaultValue={postEdit?.title} required /></label><label>Categoría<input name="category" defaultValue={postEdit?.category} required /></label></div><label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={postEdit?.slug} required /></label><label>Extracto<textarea name="excerpt" rows={3} defaultValue={postEdit?.excerpt} required /></label>
        <div className="field-row"><label>Autor<input name="author" defaultValue={postEdit?.author ?? "Gimnasio del Cerebro"} /></label><label>Imagen principal<input name="imageFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label></div><label>PDF adjunto<input name="attachmentFile" type="file" accept="application/pdf" /></label>
        <input type="hidden" name="existingImage" value={postEdit?.image ?? ""} /><input type="hidden" name="existingAttachmentUrl" value={postEdit?.attachmentUrl ?? ""} />
        {(postEdit?.image || postEdit?.attachmentUrl) && <div className="resource-preview">{postEdit.image && <Image src={postEdit.image} alt="Imagen actual del artículo" width={220} height={130} />}{postEdit.attachmentUrl && <a href={postEdit.attachmentUrl} target="_blank" rel="noreferrer">Ver PDF actual</a>}</div>}
        <label>Guía para el asistente de OpenAI<textarea name="aiBrief" rows={3} placeholder="Indica el enfoque, las ideas principales y el tono. No se publica." /></label><button className="button button--ai" type="button" disabled={aiLoading} onClick={(event) => generateDraft(event.currentTarget.form!)}><Sparkles size={17} />{aiLoading ? "Generando…" : "Generar borrador con OpenAI"}</button><label>Contenido<textarea name="content" rows={12} defaultValue={postEdit?.content} required /></label>
      </>}
      <div className="button-row"><button className="button button--primary">{editing ? "Guardar cambios" : "Guardar borrador"}</button><button className="button button--outline" type="button" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</button></div></form>}
    <div className="admin-table-wrap"><table className="admin-table content-table"><thead><tr><th>Contenido</th><th>Identificador</th><th>Recurso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="content-cell">{item.image ? <Image src={item.image} alt="" width={54} height={54} /> : <span className="content-placeholder"><Edit3 /></span>}<strong>{item.title}</strong></div></td><td>{item.meta}</td><td>{item.resource ? <a href={item.resource} target="_blank" rel="noreferrer">PDF</a> : "—"}</td><td><select defaultValue={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>{(kind === "trainings" ? ["DRAFT", "PUBLISHED", "HIDDEN"] : ["DRAFT", "PUBLISHED", "ARCHIVED"]).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></td><td><button className="icon-action" type="button" aria-label={`Editar ${item.title}`} onClick={() => openEdit(item.source)}><Edit3 size={17} /></button></td></tr>)}</tbody></table></div></>;
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
  return <form className="media-upload" onSubmit={upload}><UploadCloud /><h3>Subir recurso</h3><p>Imágenes de hasta 8 MB o PDF de hasta 20 MB.</p><input type="file" name="file" accept="image/png,image/jpeg,image/webp,image/avif,application/pdf" required /><button className="button button--primary">Subir archivo</button>{message && <span>{message}</span>}</form>;
}
