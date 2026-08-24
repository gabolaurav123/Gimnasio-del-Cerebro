import { getRuntimeValues } from "./runtime-env";

export class EvolutionApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "EvolutionApiError";
  }
}

type ProviderConfig = { baseUrl: string; apiKey: string; instanceName: string };

export async function getWhatsAppEnvironment() {
  const env = await getRuntimeValues(["EVOLUTION_API_URL", "EVOLUTION_API_KEY", "EVOLUTION_INSTANCE_NAME", "WHATSAPP_WEBHOOK_SECRET", "SITE_URL", "OPENAI_API_KEY"]);
  const baseUrl = env.EVOLUTION_API_URL?.trim().replace(/\/+$/, "") || "";
  const instanceName = env.EVOLUTION_INSTANCE_NAME?.trim() || "gimnasio-del-cerebro";
  const missingProvider = [!baseUrl && "EVOLUTION_API_URL", !env.EVOLUTION_API_KEY?.trim() && "EVOLUTION_API_KEY"].filter(Boolean) as string[];
  return {
    baseUrl,
    apiKey: env.EVOLUTION_API_KEY?.trim() || "",
    instanceName,
    webhookSecret: env.WHATSAPP_WEBHOOK_SECRET?.trim() || "",
    siteUrl: env.SITE_URL?.trim().replace(/\/+$/, "") || "",
    openAiConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    missingProvider,
    webhookReady: Boolean(env.WHATSAPP_WEBHOOK_SECRET?.trim() && env.SITE_URL?.trim()),
  };
}

async function providerConfig(): Promise<ProviderConfig> {
  const config = await getWhatsAppEnvironment();
  if (config.missingProvider.length) throw new EvolutionApiError(`Falta configurar ${config.missingProvider.join(" y ")} en el servidor.`, 503);
  let parsed: URL;
  try { parsed = new URL(config.baseUrl); } catch { throw new EvolutionApiError("EVOLUTION_API_URL no es una URL válida.", 503); }
  if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) throw new EvolutionApiError("EVOLUTION_API_URL debe usar HTTPS.", 503);
  return { baseUrl: config.baseUrl, apiKey: config.apiKey, instanceName: config.instanceName };
}

async function evolutionRequest<T>(path: string, init: RequestInit = {}) {
  const config = await providerConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: { apikey: config.apiKey, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => ({})) as T & { message?: string; error?: string };
  if (!response.ok) throw new EvolutionApiError(payload.message || payload.error || `Evolution API respondió ${response.status}.`, response.status);
  return payload;
}

export async function getConnectionState() {
  const config = await providerConfig();
  return evolutionRequest<Record<string, unknown>>(`/instance/connectionState/${encodeURIComponent(config.instanceName)}`);
}

export async function ensureEvolutionInstance() {
  const config = await providerConfig();
  try {
    await getConnectionState();
  } catch (error) {
    if (!(error instanceof EvolutionApiError) || error.status !== 404) throw error;
    await evolutionRequest(`/instance/create`, { method: "POST", body: JSON.stringify({ instanceName: config.instanceName, qrcode: true, integration: "WHATSAPP-BAILEYS" }) });
  }
  return config.instanceName;
}

export async function configureEvolutionWebhook() {
  const config = await getWhatsAppEnvironment();
  if (!config.webhookReady) return false;
  await evolutionRequest(`/webhook/set/${encodeURIComponent(config.instanceName)}`, {
    method: "POST",
    body: JSON.stringify({ enabled: true, url: `${config.siteUrl}/api/webhooks/whatsapp`, events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"], headers: { "x-webhook-secret": config.webhookSecret }, base64: false }),
  });
  return true;
}

function dataImage(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.startsWith("data:image/") ? value : `data:image/png;base64,${value}`;
}

export async function createWhatsAppQr() {
  const instanceName = await ensureEvolutionInstance();
  const webhookConfigured = await configureEvolutionWebhook();
  const payload = await evolutionRequest<Record<string, unknown>>(`/instance/connect/${encodeURIComponent(instanceName)}`);
  const nested = payload.qrcode && typeof payload.qrcode === "object" ? payload.qrcode as Record<string, unknown> : {};
  const qr = dataImage(payload.base64 || nested.base64);
  return { qr, pairingCode: String(payload.pairingCode || nested.pairingCode || ""), webhookConfigured };
}

function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function textFromMessage(value: unknown): string {
  const message = asRecord(value);
  return String(message.conversation || asRecord(message.extendedTextMessage).text || asRecord(message.imageMessage).caption || asRecord(message.documentMessage).caption || "");
}

export async function findWhatsAppChats() {
  const config = await providerConfig();
  const payload = await evolutionRequest<unknown>(`/chat/findChats/${encodeURIComponent(config.instanceName)}`, { method: "POST", body: JSON.stringify({ where: {}, take: 50, skip: 0, orderBy: { updatedAt: "desc" } }) });
  const root = asRecord(payload);
  const rows = Array.isArray(payload) ? payload : Array.isArray(root.records) ? root.records : Array.isArray(root.data) ? root.data : [];
  return rows.map((value, index) => {
    const row = asRecord(value);
    const last = asRecord(row.lastMessage);
    const remoteJid = String(row.remoteJid || row.id || asRecord(last.key).remoteJid || "");
    return {
      id: remoteJid || `chat-${index}`,
      number: remoteJid.replace(/@.+$/, "").replace(/\D/g, ""),
      name: String(row.name || row.pushName || asRecord(row.contact).pushName || remoteJid.replace(/@.+$/, "") || "Contacto"),
      lastMessage: textFromMessage(last.message || row.message) || String(row.lastMessageText || "Sin vista previa"),
      unread: Number(row.unreadMessages || row.unreadCount || 0),
      updatedAt: String(row.updatedAt || last.messageTimestamp || row.createdAt || ""),
    };
  });
}

export async function sendWhatsAppText(number: string, text: string) {
  const config = await providerConfig();
  return evolutionRequest(`/message/sendText/${encodeURIComponent(config.instanceName)}`, { method: "POST", body: JSON.stringify({ number: number.replace(/\D/g, ""), textMessage: { text }, delay: 500, linkPreview: false }) });
}
