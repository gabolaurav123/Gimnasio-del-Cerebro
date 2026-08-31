"use client";

import { Bot, CheckCircle2, KeyRound, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AssistantProfile } from "../../db/customer-repository";

type Item = { id: string; name: string; type: "PRODUCT" | "TRAINING" };
export function AssistantManager({ profiles, items, apiConfigured }: { profiles: AssistantProfile[]; items: Item[]; apiConfigured: boolean }) {
  const [selected, setSelected] = useState(items[0] ? `${items[0].type}:${items[0].id}` : "");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [itemType, itemId] = selected.split(":") as ["PRODUCT" | "TRAINING", string];
  const current = profiles.find((profile) => profile.itemType === itemType && profile.itemId === itemId);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setNotice("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/assistants", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType, itemId, name: form.get("name"), instructions: form.get("instructions"), model: form.get("model"), enabled: form.get("enabled") === "on" }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) setNotice(payload.error || "No se pudo guardar."); else { setNotice("Asistente guardado."); window.location.reload(); }
    setSaving(false);
  }
  return <div className="assistant-admin-grid"><aside className="admin-card assistant-status-card"><div className={apiConfigured ? "assistant-api assistant-api--ok" : "assistant-api"}>{apiConfigured ? <CheckCircle2 /> : <KeyRound />}<div><strong>{apiConfigured ? "API de OpenAI configurada" : "Falta OPENAI_API_KEY"}</strong><p>{apiConfigured ? "Las respuestas se procesan únicamente desde el servidor." : "Agrega la variable secreta en Seenode para activar las respuestas."}</p></div></div><h3>Programas</h3>{items.map((item) => { const profile = profiles.find((profileItem) => profileItem.itemType === item.type && profileItem.itemId === item.id); return <button className={selected === `${item.type}:${item.id}` ? "active" : ""} type="button" key={`${item.type}:${item.id}`} onClick={() => { setSelected(`${item.type}:${item.id}`); setNotice(""); }}><Bot size={17} /><span><strong>{item.name}</strong>{profile?.enabled ? "Activo" : profile ? "En pausa" : "Sin configurar"}</span></button>; })}</aside><form className="admin-card manager-form" onSubmit={save} key={selected}><div className="admin-card__heading"><div><h2>{current ? "Editar asistente" : "Configurar asistente"}</h2><p>Sus instrucciones y conversaciones quedan separadas por programa y usuario.</p></div></div><label>Nombre visible<input name="name" defaultValue={current?.name || `Asistente de ${items.find((item) => item.id === itemId)?.name || "programa"}`} minLength={3} maxLength={120} required /></label><label>Instrucciones del programa<textarea name="instructions" rows={11} defaultValue={current?.instructions || "Ayuda al usuario a comprender y aplicar el material de este programa. Basa tus respuestas únicamente en información responsable y en los recursos autorizados. Si no sabes algo, dilo claramente."} minLength={20} maxLength={8000} required /></label><div className="field-row"><label>Modelo<input name="model" defaultValue={current?.model || "gpt-5.6-luna"} pattern="[a-zA-Z0-9._-]+" required /><small>Puede ajustarse sin cambiar el código.</small></label><label className="consent consent--panel"><input name="enabled" type="checkbox" defaultChecked={current?.enabled || false} /><span>Habilitar para usuarios con acceso verificado</span></label></div>{notice && <p className={notice.includes("guardado") ? "inline-success" : "form-error"}>{notice}</p>}<button className="button button--primary" disabled={saving || !selected}><Save size={17} />{saving ? "Guardando…" : "Guardar asistente"}</button></form></div>;
}
