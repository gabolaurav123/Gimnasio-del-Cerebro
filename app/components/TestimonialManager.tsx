"use client";

import Image from "next/image";
import { Edit3, MessageSquareQuote, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Testimonial } from "../../db/repository";

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  function create() { setEditing(null); setOpen(true); setNotice(""); }
  function edit(item: Testimonial) { setEditing(item); setOpen(true); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    let thumbnail = String(data.get("existingThumbnail") || "");
    const file = data.get("thumbnailFile");
    if (file instanceof File && file.size) {
      const upload = new FormData(); upload.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: upload });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) { setNotice(payload.error || "No se pudo subir la miniatura."); return; }
      thumbnail = payload.url;
    }
    const payload = { name: data.get("name"), program: data.get("program"), quote: data.get("quote"), videoUrl: data.get("videoUrl"), thumbnail, rating: data.get("rating"), visible: data.get("visible") === "on", displayOrder: data.get("displayOrder") };
    const response = await fetch(editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials", { method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setNotice(result.error || "Revisa los datos ingresados."); return; }
    setNotice(editing ? "Testimonio actualizado." : "Testimonio agregado."); setOpen(false); setEditing(null); window.location.reload();
  }

  return <><div className="manager-actions"><button className="button button--primary" type="button" onClick={create}><Plus size={17} />Nuevo testimonio</button>{notice && <span role="status">{notice}</span>}</div>
    {open && <form className="manager-form testimonial-form" onSubmit={save} key={editing?.id || "new"}><div className="admin-card__heading"><div><h2>{editing ? "Editar testimonio" : "Agregar testimonio"}</h2><p>Incluye una miniatura vertical y el enlace del video de YouTube.</p></div></div>
      <div className="field-row"><label>Nombre o título<input name="name" defaultValue={editing?.name} required /></label><label>Entrenamiento<input name="program" defaultValue={editing?.program || ""} /></label></div>
      <label>Frase o resultado<textarea name="quote" rows={4} defaultValue={editing?.quote || ""} /></label>
      <div className="field-row"><label>URL de YouTube<input name="videoUrl" type="url" placeholder="https://www.youtube.com/shorts/..." defaultValue={editing?.videoUrl || ""} /></label><label>Miniatura<input name="thumbnailFile" type="file" accept="image/png,image/jpeg,image/webp,image/avif" /></label></div>
      <input type="hidden" name="existingThumbnail" value={editing?.thumbnail || ""} />
      {editing?.thumbnail && <div className="testimonial-preview"><Image src={editing.thumbnail} alt="Miniatura actual" width={120} height={190} /></div>}
      <div className="field-row"><label>Calificación (opcional)<select name="rating" defaultValue={editing?.rating || ""}><option value="">Sin calificación</option>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} estrellas</option>)}</select></label><label>Orden<input name="displayOrder" type="number" min={0} max={999} defaultValue={editing?.displayOrder ?? testimonials.length + 1} required /></label></div>
      <label className="manager-check"><input name="visible" type="checkbox" defaultChecked={editing?.visible ?? true} />Visible en la página inicial</label>
      <div className="button-row"><button className="button button--primary">Guardar testimonio</button><button className="button button--outline" type="button" onClick={() => { setOpen(false); setEditing(null); }}>Cancelar</button></div>
    </form>}
    <div className="testimonial-manager-grid">{testimonials.map((item) => <article key={item.id}>{item.thumbnail ? <Image src={item.thumbnail} alt="" width={120} height={190} /> : <span className="testimonial-placeholder"><MessageSquareQuote /></span>}<div><span className={`status-badge ${item.visible ? "status-badge--published" : "status-badge--hidden"}`}>{item.visible ? "Visible" : "Oculto"}</span><strong>{item.name}</strong><small>{item.program || "Historia real"}</small><button className="button button--small button--outline" type="button" onClick={() => edit(item)}><Edit3 size={15} />Editar</button></div></article>)}</div>
  </>;
}
