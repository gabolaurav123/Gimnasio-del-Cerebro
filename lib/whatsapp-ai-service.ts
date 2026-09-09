import { getSettings, getWhatsAppMessages, type WhatsAppConversation } from "../db/repository";
import { catalogContext, getWhatsAppCatalog } from "./catalog-service";
import { getRuntimeValues } from "./runtime-env";
import { getUsableOpenAIKey } from "./openai-config";
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

export async function generateWhatsAppReply(conversation: WhatsAppConversation) {
  const [settings, catalog, history, runtime] = await Promise.all([
    getSettings(),
    getWhatsAppCatalog(),
    getWhatsAppMessages(conversation.id, 18),
    getRuntimeValues(["OPENAI_API_KEY", "OPENAI_MODEL"]),
  ]);
  const apiKey = getUsableOpenAIKey(runtime.OPENAI_API_KEY);
  if (!apiKey) throw new Error("OPENAI_API_KEY no está configurada en el servidor.");
  const model = settings.whatsappAiModel?.trim() || runtime.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
  const instructions = [
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
  const input = history.map((message) => ({
    role: message.direction === "INBOUND" ? "user" : "assistant",
    content: message.content,
  }));
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 700,
      safety_identifier: await safetyIdentifier(conversation.phoneNumber),
      instructions,
      input,
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
