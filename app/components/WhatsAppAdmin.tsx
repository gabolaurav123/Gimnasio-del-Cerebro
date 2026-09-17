"use client";

import {
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  KeyRound,
  Link2,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Unplug,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { WhatsAppConnectionStatus } from "../../lib/whatsapp-bridge";
import { OpenAISettings, type OpenAISettingsStatus } from "./OpenAISettings";

type Connection = WhatsAppConnectionStatus & { openAiConfigured: boolean };
type Chat = {
  id: string;
  jid: string;
  phoneNumber: string;
  contactName: string;
  mode: "AI" | "HUMAN";
  productInterest: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};
type ChatMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  senderType: "CONTACT" | "AI" | "HUMAN";
  content: string;
  deliveryStatus: string;
  createdAt: string;
};

const statusCopy: Record<Connection["state"], { title: string; detail: string }> = {
  service_unavailable: { title: "Servicio no disponible", detail: "El proceso de vinculación QR no está activo en este servidor." },
  disconnected: { title: "WhatsApp no conectado", detail: "Vincula el teléfono para comenzar a recibir conversaciones." },
  initializing: { title: "Inicializando servicio…", detail: "Estamos preparando una nueva sesión segura." },
  generating_qr: { title: "Generando código QR…", detail: "Espera unos segundos; no cierres esta pantalla." },
  qr_available: { title: "Esperando vinculación…", detail: "Escanea el QR desde el teléfono asociado a WhatsApp." },
  connecting: { title: "Conectando WhatsApp…", detail: "El teléfono ya respondió; estamos confirmando la sesión." },
  connected: { title: "WhatsApp conectado correctamente", detail: "El canal está listo para recibir y enviar mensajes." },
  reconnecting: { title: "Reconectando…", detail: "La sesión está guardada y se está recuperando automáticamente." },
  error: { title: "No se pudo completar la conexión", detail: "Revisa el detalle y vuelve a intentarlo." },
};

const transientStates = new Set<Connection["state"]>(["initializing", "generating_qr", "qr_available", "connecting", "reconnecting"]);

function readableDate(value: string | null) {
  if (!value) return "Sin registro";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin registro" : new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

async function errorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  return payload.error || fallback;
}

export function WhatsAppAdmin({ settings, initialConnection, campaigns, openAIStatus, openAIDefaultModel }: { settings: Record<string, string>; initialConnection: Connection; campaigns: { slug: string; name: string }[]; openAIStatus: OpenAISettingsStatus; openAIDefaultModel: string }) {
  const [connection, setConnection] = useState<Connection>(initialConnection);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [assistantSaved, setAssistantSaved] = useState(false);
  const [assistantEnabled, setAssistantEnabled] = useState(settings.whatsappAiEnabled === "true");
  const [campaignSlug, setCampaignSlug] = useState(settings.whatsappCurrentCampaignSlug || "");
  const [responseDelayMs, setResponseDelayMs] = useState(settings.whatsappAiResponseDelayMs || "900");

  const refreshStatus = useCallback(async (quiet = true) => {
    try {
      const response = await fetch("/api/admin/whatsapp/status", { cache: "no-store" });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo consultar la conexión."));
      setConnection(await response.json() as Connection);
    } catch (error) {
      if (!quiet) setNotice(error instanceof Error ? error.message : "No se pudo consultar la conexión.");
    }
  }, []);

  const loadChats = useCallback(async (quiet = true) => {
    try {
      const response = await fetch("/api/admin/whatsapp/chats", { cache: "no-store" });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudieron cargar los chats."));
      const payload = await response.json() as { chats: Chat[] };
      setChats(payload.chats || []);
      setSelected((current) => current ? payload.chats.find((chat) => chat.id === current.id) || current : current);
    } catch (error) {
      if (!quiet) setNotice(error instanceof Error ? error.message : "No se pudieron cargar los chats.");
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void refreshStatus();
      void loadChats();
    }, 0);
    const statusTimer = window.setInterval(() => void refreshStatus(), 3500);
    const chatsTimer = window.setInterval(() => void loadChats(), 12_000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(statusTimer); window.clearInterval(chatsTimer); };
  }, [loadChats, refreshStatus]);

  async function generateQr() {
    setBusy("connect"); setNotice("");
    try {
      const response = await fetch("/api/admin/whatsapp/qr", { method: "POST" });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo iniciar la vinculación."));
      setConnection({ ...(await response.json() as Connection), openAiConfigured: connection.openAiConfigured });
      setNotice("La vinculación comenzó. El QR aparecerá aquí automáticamente.");
      window.setTimeout(() => void refreshStatus(), 800);
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo iniciar la vinculación."); }
    finally { setBusy(""); }
  }

  async function sessionAction(action: "test" | "reconnect" | "disconnect") {
    if (action === "disconnect" && !window.confirm("Esto cerrará la sesión vinculada y pedirá un QR nuevo la próxima vez. ¿Continuar?")) return;
    setBusy(action); setNotice("");
    try {
      const response = await fetch("/api/admin/whatsapp/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo completar la acción."));
      const payload = await response.json() as Partial<Connection> & { ok?: boolean; checkedAt?: string };
      if (action === "test") setNotice(`Conexión verificada correctamente a las ${new Intl.DateTimeFormat("es-BO", { timeStyle: "short" }).format(new Date(payload.checkedAt || Date.now()))}.`);
      else {
        setConnection((current) => ({ ...current, ...payload }));
        setNotice(action === "disconnect" ? "WhatsApp se desconectó y la sesión guardada fue eliminada." : "Reconexión iniciada.");
      }
      window.setTimeout(() => void refreshStatus(), 700);
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo completar la acción."); }
    finally { setBusy(""); }
  }

  async function selectChat(chat: Chat) {
    setSelected(chat); setBusy("chat");
    try {
      const response = await fetch(`/api/admin/whatsapp/chats/${chat.id}`, { cache: "no-store" });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo abrir la conversación."));
      const payload = await response.json() as { conversation: Chat; messages: ChatMessage[] };
      setSelected(payload.conversation); setMessages(payload.messages); void loadChats();
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo abrir la conversación."); }
    finally { setBusy(""); }
  }

  async function changeMode(mode: "AI" | "HUMAN") {
    if (!selected) return;
    setBusy("mode");
    try {
      const response = await fetch(`/api/admin/whatsapp/chats/${selected.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode }) });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo cambiar el modo."));
      const payload = await response.json() as { conversation: Chat };
      setSelected(payload.conversation); setChats((current) => current.map((chat) => chat.id === payload.conversation.id ? payload.conversation : chat));
      setNotice(mode === "HUMAN" ? "La IA quedó pausada para esta conversación." : "La IA quedó activa nuevamente para esta conversación.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo cambiar el modo."); }
    finally { setBusy(""); }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") || "").trim();
    setBusy("send"); setNotice("");
    try {
      const response = await fetch("/api/admin/whatsapp/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ conversationId: selected.id, message }) });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo enviar el mensaje."));
      form.reset();
      await selectChat(selected);
      setNotice(`Mensaje enviado a ${selected.contactName}.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo enviar el mensaje."); }
    finally { setBusy(""); }
  }

  async function saveAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("assistant"); setAssistantSaved(false); setNotice("");
    const data = new FormData(event.currentTarget);
    const body = {
      enabled: data.get("enabled") === "on",
      model: data.get("model"),
      instructions: data.get("instructions"),
      greeting: data.get("greeting"),
      handoffMessage: data.get("handoffMessage"),
      responseDelayMs: Number(data.get("responseDelayMs")),
      businessHours: data.get("businessHours"),
      currentCampaignSlug: data.get("currentCampaignSlug"),
      catalogPath: data.get("catalogPath"),
    };
    try {
      const response = await fetch("/api/admin/whatsapp/assistant", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(await errorMessage(response, "No se pudo guardar el asistente."));
      const payload = await response.json() as { ready?: boolean };
      setAssistantSaved(true);
      setNotice(payload.ready ? "Asistente guardado y listo para responder." : "Configuración guardada. Revisa arriba los pasos pendientes para activar las respuestas.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar el asistente."); }
    finally { setBusy(""); }
  }

  const connected = connection.state === "connected";
  const canRecoverSession = !connection.qr && Boolean(connection.phoneNumber && connection.lastConnectedAt);
  const status = statusCopy[connection.state];
  const statusIcon = connected ? <Wifi /> : connection.state === "error" || connection.state === "service_unavailable" ? <CircleAlert /> : transientStates.has(connection.state) ? <Loader2 className="spin" /> : <WifiOff />;
  const campaignName = campaigns.find((campaign) => campaign.slug === campaignSlug)?.name || "Sin campaña destacada";
  const setupReady = connected && connection.openAiConfigured && assistantEnabled;
  const missingSteps = [!connected ? canRecoverSession ? "recuperar la conexión guardada" : "vincular el número" : "", !connection.openAiConfigured ? "configurar OpenAI" : "", !assistantEnabled ? "activar las respuestas automáticas" : ""].filter(Boolean);
  const responseDelayLabel = responseDelayMs === "0" ? "Inmediata" : responseDelayMs === "900" ? "Aprox. 1 segundo" : responseDelayMs === "2000" ? "Aprox. 2 segundos" : "Aprox. 5 segundos";

  return <div className="whatsapp-workspace">
    <nav className="wa-section-nav" aria-label="Secciones de configuración de WhatsApp">
      <a href="#wa-vinculacion"><QrCode />Vinculación<ChevronRight /></a>
      <a href="#wa-openai"><KeyRound />OpenAI<ChevronRight /></a>
      <a href="#wa-asistente"><Bot />Cómo responde<ChevronRight /></a>
      <a href="#wa-conversaciones"><MessageCircle />Conversaciones<ChevronRight /></a>
    </nav>

    <section className="wa-overview" aria-labelledby="wa-overview-title">
      <div className="wa-overview__heading"><div><span>Configuración actual</span><h2 id="wa-overview-title">Todo lo importante, visible al entrar.</h2></div><strong className={setupReady ? "ready" : "pending"}>{setupReady ? <CheckCircle2 /> : <CircleAlert />}{setupReady ? "Listo para responder" : "Configuración incompleta"}</strong></div>
      <div className="wa-overview__grid">
        <a href="#wa-vinculacion"><span><Smartphone /></span><small>Canal</small><strong>{status.title}</strong><em>{connection.phoneNumber ? `+${connection.phoneNumber}` : "Sin número vinculado"}</em></a>
        <a href="#wa-openai"><span><KeyRound /></span><small>Inteligencia artificial</small><strong>{connection.openAiConfigured ? "OpenAI conectado" : "OpenAI pendiente"}</strong><em>{connection.openAiConfigured ? "Clave validada en el servidor" : "Agrega y prueba la API Key"}</em></a>
        <a href="#wa-asistente"><span><Bot /></span><small>Respuestas</small><strong>{assistantEnabled ? "Automáticas activadas" : "Automáticas desactivadas"}</strong><em>{responseDelayLabel}</em></a>
        <a href="#wa-asistente"><span><Settings2 /></span><small>Campaña principal</small><strong>{campaignName}</strong><em>Se puede cambiar sin reprogramar la IA</em></a>
      </div>
      <div className={`wa-overview__readiness ${setupReady ? "ready" : ""}`}>{setupReady ? <><CheckCircle2 /><span><strong>El canal está preparado.</strong> Los mensajes entrantes pueden recibir respuesta automática con el catálogo y las reglas configuradas.</span></> : <><CircleAlert /><span><strong>Para que la IA responda falta:</strong> {missingSteps.join(", ")}.</span></>}</div>
    </section>

    <div className="whatsapp-control-grid" id="wa-vinculacion">
      <section className="admin-card whatsapp-status-card">
        <div className="admin-card__heading"><div><h2><Smartphone size={20} /> Estado de WhatsApp</h2><p>Información real de la sesión vinculada y del servicio.</p></div><button className="icon-action" type="button" onClick={() => void refreshStatus(false)} aria-label="Actualizar estado"><RefreshCw size={17} /></button></div>
        <div className={`wa-status-hero wa-status-hero--${connection.state}`} aria-live="polite"><span>{statusIcon}</span><div><strong>{status.title}</strong><p>{status.detail}</p></div></div>
        <dl className="wa-status-data"><div><dt>Número conectado</dt><dd>{connection.phoneNumber ? `+${connection.phoneNumber}` : "—"}</dd></div><div><dt>Nombre de la cuenta</dt><dd>{connection.accountName || "—"}</dd></div><div><dt>Última conexión</dt><dd>{readableDate(connection.lastConnectedAt)}</dd></div><div><dt>Servicio</dt><dd>{connection.available ? "Operativo" : "No disponible"}</dd></div></dl>
        {connection.error && <div className="admin-callout admin-callout--warning"><strong>Detalle</strong><p>{connection.error}</p></div>}
        {connected && <div className="wa-session-actions"><button className="button button--outline" type="button" disabled={Boolean(busy)} onClick={() => void sessionAction("test")}><ShieldCheck size={16} />Probar conexión</button><button className="button button--outline" type="button" disabled={Boolean(busy)} onClick={() => void sessionAction("reconnect")}><RotateCcw size={16} />Reconectar</button><button className="button button--danger-soft" type="button" disabled={Boolean(busy)} onClick={() => void sessionAction("disconnect")}><Unplug size={16} />Desconectar</button></div>}
      </section>

      <section className="admin-card whatsapp-link-card">
        <div className="admin-card__heading"><div><h2><QrCode size={20} /> Vinculación</h2><p>Escanea un QR real como al vincular WhatsApp Web.</p></div></div>
        {connected ? <div className="wa-connected-panel"><CheckCircle2 /><h3>Sesión vinculada</h3><p>El QR se oculta mientras la conexión permanece válida. La sesión se recuperará automáticamente al reiniciar el servidor.</p></div> : connection.qr ? <div className="wa-qr-panel"><div className="wa-qr-frame"><img src={connection.qr} alt="Código QR para vincular WhatsApp" /></div><strong>Esperando vinculación…</strong><p>El código se renueva automáticamente cuando expira.</p></div> : <div className="wa-link-empty">{transientStates.has(connection.state) ? <Loader2 className="spin" /> : <QrCode />}<h3>{status.title}</h3><p>{connection.available ? canRecoverSession ? "La sesión está guardada. Puedes recuperar la conexión sin desvincular el teléfono." : "Pulsa el botón para iniciar una nueva vinculación." : "La vinculación QR necesita el servidor Node de producción."}</p></div>}
        {!connected && <button className="button button--primary wa-link-button" type="button" disabled={Boolean(busy) || !connection.available || transientStates.has(connection.state)} onClick={canRecoverSession ? () => void sessionAction("reconnect") : generateQr}>{canRecoverSession ? <RotateCcw size={18} /> : <QrCode size={18} />}{busy ? "Conectando…" : canRecoverSession ? "Reconectar sesión guardada" : connection.qr ? "Generar nuevo QR" : "Vincular WhatsApp"}</button>}
        <div className="wa-link-instructions"><strong>Cómo vincularlo</strong><ol><li>Abre WhatsApp en tu teléfono.</li><li>Entra en <b>Dispositivos vinculados</b>.</li><li>Pulsa <b>Vincular dispositivo</b>.</li><li>Escanea este código QR.</li></ol></div>
      </section>
    </div>

    <div className="whatsapp-openai-shell" id="wa-openai">
      <OpenAISettings initialStatus={openAIStatus} defaultModel={openAIDefaultModel} onStatusChange={(nextStatus) => setConnection((current) => ({ ...current, openAiConfigured: nextStatus.configured }))} />
    </div>

    <section className="admin-card whatsapp-conversations-card" id="wa-conversaciones">
      <div className="admin-card__heading"><div><h2><MessageCircle size={20} /> Conversaciones</h2><p>Revisa el historial y cambia entre respuesta automática y atención humana.</p></div><button className="button button--small button--outline" type="button" disabled={busy === "chat"} onClick={() => void loadChats(false)}><RefreshCw size={15} />Actualizar</button></div>
      <div className="wa-chat-layout">
        <aside className="wa-chat-list">{chats.length ? chats.map((chat) => <button className={selected?.id === chat.id ? "active" : ""} type="button" key={chat.id} onClick={() => void selectChat(chat)}><span className="wa-chat-avatar">{chat.contactName.slice(0, 2).toUpperCase()}</span><span className="wa-chat-preview"><strong>{chat.contactName}</strong><small>{chat.lastMessage}</small><em>{chat.productInterest || `+${chat.phoneNumber}`}</em></span><span className={`wa-mode-dot wa-mode-dot--${chat.mode.toLowerCase()}`}>{chat.mode === "AI" ? "IA" : "Humano"}</span>{chat.unreadCount > 0 && <b>{chat.unreadCount}</b>}</button>) : <div className="admin-empty admin-empty--compact"><MessageCircle /><h3>Sin conversaciones</h3><p>Los mensajes recibidos aparecerán aquí cuando WhatsApp esté conectado.</p></div>}</aside>
        <div className="wa-chat-panel">{selected ? <><header><div><strong>{selected.contactName}</strong><span>+{selected.phoneNumber}{selected.productInterest ? ` · Interés: ${selected.productInterest}` : ""}</span></div><div className="wa-mode-control" role="group" aria-label="Modo de atención"><button type="button" className={selected.mode === "AI" ? "active" : ""} disabled={busy === "mode"} onClick={() => void changeMode("AI")}><Bot size={15} />IA activa</button><button type="button" className={selected.mode === "HUMAN" ? "active" : ""} disabled={busy === "mode"} onClick={() => void changeMode("HUMAN")}><UserRound size={15} />Atención humana</button></div></header><div className="wa-messages">{busy === "chat" ? <Loader2 className="spin" /> : messages.map((message) => <article className={`wa-message wa-message--${message.direction.toLowerCase()}`} key={message.id}><p>{message.content}</p><footer><span>{message.senderType === "CONTACT" ? selected.contactName : message.senderType === "AI" ? "Asistente IA" : "Equipo"}</span><time>{readableDate(message.createdAt)}</time></footer></article>)}</div><form className="wa-compose" onSubmit={sendMessage}><textarea name="message" rows={2} maxLength={3000} placeholder="Escribe una respuesta manual…" required /><button type="submit" aria-label="Enviar mensaje" disabled={busy === "send" || !connected}>{busy === "send" ? <Loader2 className="spin" /> : <Send />}</button></form></> : <div className="admin-empty"><Send /><h3>Selecciona una conversación</h3><p>Aquí verás el historial completo y podrás responder manualmente.</p></div>}</div>
      </div>
    </section>

    <form className="whatsapp-config-grid" id="wa-asistente" onSubmit={saveAssistant}>
      <section className="admin-card whatsapp-assistant-card">
        <div className="admin-card__heading"><div><h2><Bot size={20} /> Cómo responderá la IA</h2><p>Personaliza el tono y las prioridades sin perder las reglas de seguridad.</p></div><div className="wa-readiness-group"><span className={`wa-readiness ${connection.openAiConfigured ? "ready" : ""}`}>{connection.openAiConfigured ? <CheckCircle2 /> : <CircleAlert />}{connection.openAiConfigured ? "OpenAI listo" : "Falta OpenAI"}</span>{!connection.openAiConfigured && <a href="#wa-openai">Configurar API</a>}</div></div>
        <div className="wa-behavior-summary"><strong>Reglas base activas</strong><div><span><CheckCircle2 />Tono cálido, humano y sin presión</span><span><CheckCircle2 />Catálogo, precios y enlaces reales</span><span><CheckCircle2 />Contexto de los últimos 18 mensajes</span><span><CheckCircle2 />Derivación automática a una persona</span><span><CheckCircle2 />Sin inventar datos ni prometer resultados</span></div></div>
        <div className="assistant-toggle"><input id="whatsapp-ai-enabled" name="enabled" type="checkbox" checked={assistantEnabled} onChange={(event) => setAssistantEnabled(event.target.checked)} /><label htmlFor="whatsapp-ai-enabled"><strong>Responder automáticamente</strong><small>La IA se pausa de forma individual cuando una conversación pasa a atención humana.</small></label></div>
        <div className="field-row"><label>Modelo de OpenAI<input name="model" pattern="[A-Za-z0-9._-]+" defaultValue={settings.whatsappAiModel || "gpt-5.6-luna"} required /></label><label>Campaña destacada<select name="currentCampaignSlug" value={campaignSlug} onChange={(event) => setCampaignSlug(event.target.value)}><option value="">Sin campaña destacada</option>{campaigns.map((campaign) => <option value={campaign.slug} key={campaign.slug}>{campaign.name}</option>)}</select></label></div>
        <label>Instrucciones editables: tono, prioridades y respuestas<textarea name="instructions" rows={8} minLength={30} maxLength={6000} defaultValue={settings.whatsappAiInstructions} required /><small>Describe aquí cómo quieres que atienda. Las reglas de veracidad, privacidad y seguridad siempre se mantienen.</small></label>
      </section>

      <section className="admin-card whatsapp-settings-card">
        <div className="admin-card__heading"><div><h2><Settings2 size={20} /> Configuración</h2><p>Mensajes, tiempos y enlaces que pueden cambiar sin reprogramar la IA.</p></div></div>
        <label>Mensaje inicial<textarea name="greeting" rows={3} minLength={10} maxLength={700} defaultValue={settings.whatsappAiGreeting} required /></label>
        <label>Mensaje de derivación a una persona<textarea name="handoffMessage" rows={3} minLength={10} maxLength={700} defaultValue={settings.whatsappAiHandoffMessage} required /></label>
        <div className="field-row"><label>Tiempo de respuesta<select name="responseDelayMs" value={responseDelayMs} onChange={(event) => setResponseDelayMs(event.target.value)}><option value="0">Inmediata</option><option value="900">Aprox. 1 segundo</option><option value="2000">Aprox. 2 segundos</option><option value="5000">Aprox. 5 segundos</option></select></label><label>Ruta del catálogo<span className="input-with-icon"><Link2 size={16} /><input name="catalogPath" defaultValue={settings.whatsappCatalogPath || "/entrenamientos"} pattern="/(?!/).*" required /></span></label></div>
        <label>Horario e indicaciones operativas<textarea name="businessHours" rows={3} minLength={5} maxLength={700} defaultValue={settings.whatsappAiBusinessHours} required /></label>
      </section>
      <div className="whatsapp-config-actions"><button className="button button--primary" disabled={busy === "assistant"}>{busy === "assistant" ? <Loader2 className="spin" /> : <Bot size={17} />}Guardar configuración</button>{assistantSaved && <span className="inline-success"><Check size={16} />Configuración guardada</span>}<small><Clock3 size={14} />Los secretos y la sesión nunca se muestran en este panel.</small></div>
    </form>
    {notice && <div className="admin-toast" role="status">{notice}</div>}
  </div>;
}
