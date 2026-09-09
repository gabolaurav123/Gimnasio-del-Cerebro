"use client";

import { Bot, CheckCircle2, EyeOff, KeyRound, Loader2, Play, Save, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import type { OpenAIKeySource } from "../../lib/openai-config";

type Status = { configured: boolean; source: OpenAIKeySource };

async function responseMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  return payload.error || fallback;
}

export function OpenAISettings({ initialStatus, defaultModel }: { initialStatus: Status; defaultModel: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [reply, setReply] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("save"); setNotice(""); setReply("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/openai", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ apiKey: apiKey || undefined, model: form.get("model") }) });
    if (!response.ok) setNotice(await responseMessage(response, "No se pudo guardar la configuración."));
    else {
      const payload = await response.json() as Status;
      setStatus(payload); setApiKey(""); setNotice(payload.configured ? "Configuración de OpenAI guardada y validada." : "Modelo guardado. Ingresa una API Key para activar la inteligencia artificial.");
    }
    setBusy("");
  }

  async function testConnection() {
    setBusy("connection"); setNotice("");
    const response = await fetch("/api/admin/openai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "connection" }) });
    setNotice(response.ok ? "Conexión con OpenAI verificada correctamente." : await responseMessage(response, "No se pudo verificar OpenAI."));
    setBusy("");
  }

  async function testAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("assistant"); setNotice(""); setReply("");
    const message = String(new FormData(event.currentTarget).get("message") || "");
    const response = await fetch("/api/admin/openai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "assistant", message }) });
    if (!response.ok) setNotice(await responseMessage(response, "No se pudo probar el asistente."));
    else setReply(((await response.json()) as { reply: string }).reply);
    setBusy("");
  }

  async function removeKey() {
    if (!window.confirm("¿Eliminar la clave de OpenAI guardada en el panel? Los asistentes dejarán de responder hasta configurar otra.")) return;
    setBusy("delete"); setNotice(""); setReply("");
    const response = await fetch("/api/admin/openai", { method: "DELETE" });
    if (!response.ok) setNotice(await responseMessage(response, "No se pudo eliminar la clave."));
    else { const payload = await response.json() as Status; setStatus(payload); setNotice(payload.configured ? "Se eliminó la clave del panel; continúa activa la clave configurada en el servidor." : "Clave eliminada. OpenAI quedó desactivado."); }
    setBusy("");
  }

  const source = status.source === "panel" ? "Guardada cifrada en el panel" : status.source === "environment" ? "Configurada en el servidor" : "Sin configurar";
  return <section className="admin-card openai-settings" id="openai"><div className="admin-card__heading"><div><h2><Bot size={21} /> OpenAI e inteligencia artificial</h2><p>Configura una sola clave segura para WhatsApp, asistentes personalizados y el apoyo editorial.</p></div><span className={`openai-status ${status.configured ? "ready" : ""}`}>{status.configured ? <CheckCircle2 /> : <EyeOff />}{status.configured ? "Conectado" : "Pendiente"}</span></div><div className="openai-security"><ShieldCheck /><div><strong>La clave nunca vuelve al navegador</strong><p>Se valida antes de guardarse y queda cifrada con el secreto del servidor. Aquí solo se muestra su estado.</p></div></div><form className="settings-form openai-key-form" onSubmit={save}><label>API Key de OpenAI<input type="password" name="apiKey" autoComplete="new-password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={status.configured ? "Dejar vacío para conservar la clave actual" : "sk-…"} /><small>{source}</small></label><label>Modelo general predeterminado<input name="model" defaultValue={defaultModel || "gpt-5.6-luna"} pattern="[A-Za-z0-9._-]+" required /><small>WhatsApp puede usar un modelo específico desde WhatsApp + IA.</small></label><div className="button-row"><button className="button button--primary" disabled={Boolean(busy)}><Save size={17} />{busy === "save" ? "Validando…" : "Guardar y validar"}</button><button className="button button--outline" type="button" disabled={Boolean(busy) || !status.configured} onClick={() => void testConnection()}>{busy === "connection" ? <Loader2 className="spin" /> : <Play size={17} />}Probar conexión</button>{status.source === "panel" && <button className="button button--danger-soft" type="button" disabled={Boolean(busy)} onClick={() => void removeKey()}><Trash2 size={17} />Eliminar clave</button>}</div></form><form className="openai-preview" onSubmit={testAssistant}><div><KeyRound /><span><strong>Probar el asistente de WhatsApp</strong><small>Esta prueba utiliza el mismo prompt, campaña y catálogo que responderán al número vinculado.</small></span></div><textarea name="message" rows={3} defaultValue="Quiero información sobre Super Cerebro, cuánto cuesta y cómo puedo adquirirlo." minLength={2} maxLength={1200} required /><button className="button button--outline" disabled={Boolean(busy) || !status.configured}>{busy === "assistant" ? <Loader2 className="spin" /> : <Bot size={17} />}Generar respuesta de prueba</button>{reply && <div className="openai-preview__reply"><strong>Respuesta del asistente</strong><p>{reply}</p></div>}</form>{notice && <p className={notice.includes("correct") || notice.includes("guardad") || notice.includes("elimin") ? "inline-success" : "form-error"} role="status">{notice}</p>}</section>;
}
