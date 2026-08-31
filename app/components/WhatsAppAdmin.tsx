"use client";

import { Bot, Check, MessageCircle, QrCode, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

type Connection = { configured: boolean; state: string; missing?: string[]; providerError?: string; webhookReady: boolean; openAiConfigured: boolean; instanceName: string };
type Chat = { id: string; number: string; name: string; lastMessage: string; unread: number; updatedAt: string };

export function WhatsAppAdmin({ settings, initialConnection }: { settings: Record<string, string>; initialConnection: Connection }) {
  const [connection, setConnection] = useState<Connection | null>(initialConnection);
  const [qr, setQr] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<Chat | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [assistantSaved, setAssistantSaved] = useState(false);

  async function refreshStatus() {
    const response = await fetch("/api/admin/whatsapp/status", { cache: "no-store" });
    const payload = await response.json() as Connection & { error?: string };
    if (response.ok) setConnection(payload); else setNotice(payload.error || "No se pudo consultar la conexión.");
  }

  async function generateQr() {
    setLoading(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp/qr", { method: "POST" });
    const payload = await response.json() as { qr?: string; pairingCode?: string; error?: string; webhookConfigured?: boolean };
    setLoading(false);
    if (!response.ok) { setNotice(payload.error || "No se pudo generar el QR."); return; }
    setQr(payload.qr || ""); setPairingCode(payload.pairingCode || "");
    setNotice(payload.webhookConfigured ? "QR generado y webhook seguro configurado." : "QR generado. Falta configurar SITE_URL o WHATSAPP_WEBHOOK_SECRET para respuestas automáticas.");
  }

  async function loadChats() {
    setLoading(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp/chats", { cache: "no-store" });
    const payload = await response.json() as { chats?: Chat[]; error?: string };
    setLoading(false);
    if (!response.ok) { setNotice(payload.error || "No se pudieron cargar los chats."); return; }
    setChats(payload.chats || []); setNotice(`${payload.chats?.length || 0} chats cargados.`);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") || "");
    setLoading(true);
    const response = await fetch("/api/admin/whatsapp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ number: selected.number, message }) });
    const payload = await response.json() as { error?: string };
    setLoading(false); setNotice(response.ok ? `Mensaje enviado a ${selected.name}.` : payload.error || "No se pudo enviar.");
    if (response.ok) form.reset();
  }

  async function saveAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/whatsapp/assistant", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: data.get("enabled") === "on", model: data.get("model"), instructions: data.get("instructions") }) });
    const payload = await response.json() as { error?: string; ready?: boolean };
    setAssistantSaved(response.ok);
    setNotice(response.ok ? (payload.ready ? "Asistente guardado y listo para responder." : "Configuración guardada; todavía faltan variables del servidor.") : payload.error || "No se pudo guardar el asistente.");
  }

  const connected = connection?.state === "open" || connection?.state === "connected";
  return <div className="whatsapp-admin-grid">
    <section className="admin-card whatsapp-setup-card">
      <div className="admin-card__heading"><div><h2><QrCode size={19} /> Vincular número</h2><p>Genera un QR real mediante Evolution API y escanéalo desde Dispositivos vinculados.</p></div><button className="icon-action" type="button" onClick={refreshStatus} aria-label="Actualizar estado"><RefreshCw size={17} /></button></div>
      <div className={`connection-state ${connected ? "connection-state--ok" : ""}`}><span /><div><strong>{connected ? "WhatsApp conectado" : connection?.state === "not_configured" ? "Proveedor sin configurar" : connection?.state === "not_created" ? "Instancia lista para crear" : "WhatsApp no conectado"}</strong><small>{connection?.instanceName || "Consultando…"}</small></div></div>
      {connection?.missing?.length ? <div className="admin-callout admin-callout--warning"><strong>Variables pendientes</strong><p>{connection.missing.join(", ")}</p></div> : null}
      {connection?.providerError ? <div className="admin-callout admin-callout--warning"><strong>Error del proveedor</strong><p>{connection.providerError}</p></div> : null}
      <button className="button button--primary" type="button" disabled={loading || !connection?.configured} onClick={generateQr}><QrCode size={17} />{loading ? "Conectando…" : "Generar / renovar QR"}</button>
      {qr && <div className="qr-panel"><img src={qr} alt="Código QR para vincular WhatsApp" /><p>WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo.</p></div>}
      {pairingCode && <div className="pairing-code"><span>Código de vinculación</span><strong>{pairingCode}</strong></div>}
      <div className="readiness-list"><span className={connection?.webhookReady ? "ready" : ""}><ShieldCheck />Webhook seguro</span><span className={connection?.openAiConfigured ? "ready" : ""}><Bot />OpenAI</span></div>
    </section>

    <section className="admin-card whatsapp-chats-card">
      <div className="admin-card__heading"><div><h2><MessageCircle size={19} /> Chats vinculados</h2><p>Consulta conversaciones recientes y responde manualmente desde el panel.</p></div><button className="button button--small button--outline" type="button" disabled={loading || !connected} onClick={loadChats}><RefreshCw size={15} />Actualizar</button></div>
      <div className="chat-layout"><div className="chat-list">{chats.length ? chats.map((chat) => <button className={selected?.id === chat.id ? "active" : ""} type="button" key={chat.id} onClick={() => setSelected(chat)}><span>{chat.name.slice(0, 2).toUpperCase()}</span><div><strong>{chat.name}</strong><p>{chat.lastMessage}</p></div>{chat.unread > 0 && <small>{chat.unread}</small>}</button>) : <div className="admin-empty admin-empty--compact"><MessageCircle /><h3>Sin chats cargados</h3><p>Conecta el número y pulsa Actualizar.</p></div>}</div>
      <div className="chat-compose">{selected ? <><div><strong>{selected.name}</strong><small>+{selected.number}</small></div><form onSubmit={sendMessage}><textarea name="message" rows={5} maxLength={3000} placeholder="Escribe una respuesta…" required /><button className="button button--primary" disabled={loading}><Send size={16} />Enviar</button></form></> : <div className="admin-empty admin-empty--compact"><Send /><h3>Selecciona un chat</h3><p>Aquí podrás escribir una respuesta manual.</p></div>}</div></div>
    </section>

    <section className="admin-card whatsapp-assistant-card">
      <div className="admin-card__heading"><div><h2><Bot size={19} /> Asistente automático con IA</h2><p>Las instrucciones quedan en la base de datos; la clave de OpenAI permanece únicamente en el servidor.</p></div></div>
      <form className="manager-form whatsapp-assistant-form" onSubmit={saveAssistant}>
        <div className="assistant-toggle"><input id="whatsapp-ai-enabled" name="enabled" type="checkbox" defaultChecked={settings.whatsappAiEnabled === "true"} /><label htmlFor="whatsapp-ai-enabled"><strong>Responder automáticamente</strong><small>Solo mensajes de chats individuales; ignora grupos y mensajes enviados por la cuenta.</small></label></div>
        <label>Modelo de OpenAI<input name="model" pattern="[A-Za-z0-9._-]+" defaultValue={settings.whatsappAiModel || "gpt-5.6-luna"} required /></label>
        <label>Instrucciones del asistente<textarea name="instructions" rows={8} minLength={30} maxLength={6000} defaultValue={settings.whatsappAiInstructions} required /></label>
        <button className="button button--primary"><Bot size={17} />Guardar asistente</button>
        {assistantSaved && <span className="inline-success"><Check size={16} />Configuración guardada</span>}
      </form>
    </section>
    {notice && <div className="admin-toast" role="status">{notice}</div>}
  </div>;
}
