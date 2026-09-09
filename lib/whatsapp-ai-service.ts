import { getSettings, getWhatsAppMessages, type WhatsAppConversation } from "../db/repository";
import { catalogContext, getWhatsAppCatalog } from "./catalog-service";
import { getRuntimeValues } from "./runtime-env";
import { getOpenAIConfiguration } from "./openai-config";
import { AI_CONFIG } from "./whatsapp-ai-config";

function outputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text.trim();
  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item) => item && typeof item === "object" && Array.isArray((item as { content?: unknown[] }).content) ? (item as { content: unknown[] }).content : [])
    .filter((item): item is { type: string; text?: string } => Boolean(item && typeof item === "object" && (item as { type?: string }).type === "output_text"))
    .map((item) => item.text || "")
    .join("\n")
    .trim();
}

async function safetyIdentifier(phoneNumber: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`gdc-whatsapp:${phoneNumber}`));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 64);
}

export function buildWhatsAppInstructions(settings: Record<string, string>, catalog: Awaited<ReturnType<typeof getWhatsAppCatalog>>) {
  return [
    AI_CONFIG.identity,
    `OBJETIVO\n${AI_CONFIG.objective}`,
    `PERSONALIDAD\n${AI_CONFIG.personality.join(", ")}.`,
    `FLUJO ORIENTATIVO\n${AI_CONFIG.conversationFlow.map((rule) => `- ${rule}`).join("\n")}`,
    `REGLAS OBLIGATORIAS\n${AI_CONFIG.strictRules.map((rule) => `- ${rule}`).join("\n")}`,
    `RESPUESTA CUANDO FALTA UN DATO\n${AI_CONFIG.fallback}`,
    `SALUDO CONFIGURADO (úsalo solo al inicio y de forma natural)\n${settings.whatsappAiGreeting}`,
    `HORARIO/OPERACIÓN CONFIRMADA\n${settings.whatsappAiBusinessHours}`,
    `INSTRUCCIONES ADICIONALES DEL ADMINISTRADOR\n${settings.whatsappAiInstructions}`,
    catalogContext(catalog),
  ].join("\n\n");
}

async function requestWhatsAppReply(input: { phoneNumber: string; history: { role: "user" | "assistant"; content: string }[]; settings: Record<string, string>; catalog: Awaited<ReturnType<typeof getWhatsAppCatalog>> }) {
  const [configuration, runtime] = await Promise.all([getOpenAIConfiguration(), getRuntimeValues(["OPENAI_MODEL"])]);
  if (!configuration.apiKey) throw new Error("La API de OpenAI no está configurada.");
  const model = input.settings.whatsappAiModel?.trim() || runtime.OPENAI_MODEL?.trim() || input.settings.openAiDefaultModel?.trim() || "gpt-5.6-luna";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${configuration.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 700,
      safety_identifier: await safetyIdentifier(input.phoneNumber),
      instructions: buildWhatsAppInstructions(input.settings, input.catalog),
      input: input.history,
    }),
    signal: AbortSignal.timeout(40_000),
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const error = payload.error && typeof payload.error === "object" ? payload.error as Record<string, unknown> : {};
    throw new Error(String(error.message || "OpenAI no pudo responder en este momento."));
  }
  const reply = outputText(payload);
  if (!reply) throw new Error("OpenAI no devolvió una respuesta utilizable.");
  return reply;
}

export async function generateWhatsAppReply(conversation: WhatsAppConversation) {
  const [settings, catalog, history] = await Promise.all([
    getSettings(),
    getWhatsAppCatalog(),
    getWhatsAppMessages(conversation.id, 18),
  ]);
  return requestWhatsAppReply({ phoneNumber: conversation.phoneNumber, settings, catalog, history: history.map((message) => ({
    role: message.direction === "INBOUND" ? "user" : "assistant",
    content: message.content,
  })) });
}

export async function previewWhatsAppReply(message: string) {
  const [settings, catalog] = await Promise.all([getSettings(), getWhatsAppCatalog()]);
  return requestWhatsAppReply({ phoneNumber: "admin-preview", settings, catalog, history: [{ role: "user", content: message }] });
}
