import { getRuntimeValues } from "./runtime-env";
import { getOpenAIConfiguration } from "./openai-config";

export type WhatsAppConnectionState =
  | "service_unavailable"
  | "disconnected"
  | "initializing"
  | "generating_qr"
  | "qr_available"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type WhatsAppConnectionStatus = {
  available: boolean;
  state: WhatsAppConnectionState;
  qr: string | null;
  qrExpiresAt: string | null;
  phoneNumber: string | null;
  accountName: string | null;
  lastConnectedAt: string | null;
  serviceStartedAt: string | null;
  recoveredSession: boolean;
  error: string | null;
};

export class WhatsAppBridgeError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
    this.name = "WhatsAppBridgeError";
  }
}

async function bridgeConfig() {
  const [values, openAI] = await Promise.all([getRuntimeValues(["WHATSAPP_BRIDGE_URL", "WHATSAPP_BRIDGE_TOKEN"]), getOpenAIConfiguration()]);
  const url = values.WHATSAPP_BRIDGE_URL?.trim().replace(/\/+$/, "") || "";
  const token = values.WHATSAPP_BRIDGE_TOKEN?.trim() || "";
  return { url, token, openAiConfigured: openAI.configured };
}

async function bridgeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = await bridgeConfig();
  if (!config.url || !config.token) throw new WhatsAppBridgeError("El servicio de vinculación QR no está activo en este servidor.", 503);
  let parsed: URL;
  try { parsed = new URL(config.url); } catch { throw new WhatsAppBridgeError("La dirección interna del servicio de WhatsApp no es válida.", 503); }
  if (parsed.protocol !== "https:" && !["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) throw new WhatsAppBridgeError("El servicio interno de WhatsApp requiere HTTPS o una conexión local.", 503);
  let response: Response;
  try {
    response = await fetch(`${config.url}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${config.token}`, accept: "application/json", ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name);
    throw new WhatsAppBridgeError(timedOut ? "El servicio de WhatsApp tardó demasiado en responder." : "No se pudo comunicar con el servicio de WhatsApp.", timedOut ? 504 : 503);
  }
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new WhatsAppBridgeError(payload.error || "El servicio de WhatsApp devolvió un error.", response.status);
  return payload;
}

export async function getWhatsAppStatus(): Promise<WhatsAppConnectionStatus & { openAiConfigured: boolean }> {
  const config = await bridgeConfig();
  if (!config.url || !config.token) {
    return {
      available: false,
      state: "service_unavailable",
      qr: null,
      qrExpiresAt: null,
      phoneNumber: null,
      accountName: null,
      lastConnectedAt: null,
      serviceStartedAt: null,
      recoveredSession: false,
      error: "El servicio QR está disponible en el servidor Node de producción, pero no se inició en este entorno.",
      openAiConfigured: config.openAiConfigured,
    };
  }
  try {
    return { ...(await bridgeRequest<WhatsAppConnectionStatus>("/status")), openAiConfigured: config.openAiConfigured };
  } catch (error) {
    return {
      available: false,
      state: "service_unavailable",
      qr: null,
      qrExpiresAt: null,
      phoneNumber: null,
      accountName: null,
      lastConnectedAt: null,
      serviceStartedAt: null,
      recoveredSession: false,
      error: error instanceof Error ? error.message : "Servicio de WhatsApp no disponible.",
      openAiConfigured: config.openAiConfigured,
    };
  }
}

export const startWhatsAppLink = () => bridgeRequest<WhatsAppConnectionStatus>("/connect", { method: "POST" });
export const reconnectWhatsApp = () => bridgeRequest<WhatsAppConnectionStatus>("/reconnect", { method: "POST" });
export const disconnectWhatsApp = () => bridgeRequest<WhatsAppConnectionStatus>("/disconnect", { method: "POST" });
export const testWhatsAppConnection = () => bridgeRequest<{ ok: boolean; checkedAt: string }>("/test", { method: "POST" });
export const sendWhatsAppMessage = (jid: string, text: string) => bridgeRequest<{ id: string | null; sentAt: string }>("/send", { method: "POST", body: JSON.stringify({ jid, text }) });
