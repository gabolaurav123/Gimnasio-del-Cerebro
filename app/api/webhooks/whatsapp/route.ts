import { claimWhatsAppEvent, getSettings, releaseWhatsAppEvent } from "../../../../db/repository";
import { getWhatsAppEnvironment, sendWhatsAppText } from "../../../../lib/evolution-api";
import { getRuntimeValues } from "../../../../lib/runtime-env";

function secureEqual(left: string, right: string) {
  if (left.length !== right.length || !left.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function messageText(messageValue: unknown) {
  const message = record(messageValue);
  return String(message.conversation || record(message.extendedTextMessage).text || record(message.imageMessage).caption || record(message.documentMessage).caption || "").trim();
}
function outputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === "string") return payload.output_text.trim();
  const output = Array.isArray(payload.output) ? payload.output : [];
  return output.flatMap((item) => Array.isArray(record(item).content) ? record(item).content as unknown[] : []).map(record).filter((item) => item.type === "output_text").map((item) => String(item.text || "")).join("\n").trim();
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 1024 * 1024) return Response.json({ error: "Payload demasiado grande" }, { status: 413 });
  const environment = await getWhatsAppEnvironment();
  if (!environment.webhookSecret || !secureEqual(request.headers.get("x-webhook-secret") || "", environment.webhookSecret)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const payload = record(await request.json().catch(() => null));
  if (payload.instance && String(payload.instance) !== environment.instanceName) return Response.json({ error: "Instancia inválida" }, { status: 403 });
  const event = String(payload.event || "").toUpperCase().replace(/[.-]/g, "_");
  if (event && event !== "MESSAGES_UPSERT") return Response.json({ accepted: true }, { status: 202 });
  const values = Array.isArray(payload.data) ? payload.data : [payload.data];
  for (const value of values) {
    const data = record(value);
    const key = record(data.key);
    const remoteJid = String(key.remoteJid || data.remoteJid || "");
    const providerMessageId = String(key.id || data.id || "");
    if (!remoteJid || !providerMessageId || Boolean(key.fromMe) || remoteJid.endsWith("@g.us")) continue;
    const text = messageText(data.message || payload.message);
    if (!text || !(await claimWhatsAppEvent(providerMessageId))) continue;
    const settings = await getSettings();
    if (settings.whatsappAiEnabled !== "true") continue;
    const env = await getRuntimeValues(["OPENAI_API_KEY"]);
    if (!env.OPENAI_API_KEY) continue;
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ model: settings.whatsappAiModel || "gpt-5-mini", store: false, max_output_tokens: 500, instructions: settings.whatsappAiInstructions, input: `Nombre del contacto: ${String(data.pushName || "No indicado")}\nMensaje recibido por WhatsApp:\n${text}` }),
        signal: AbortSignal.timeout(30000),
      });
      const openAiPayload = record(await response.json().catch(() => null));
      if (!response.ok) throw new Error(String(record(openAiPayload.error).message || "OpenAI no pudo responder"));
      const answer = outputText(openAiPayload);
      if (!answer) throw new Error("OpenAI no devolvió una respuesta utilizable.");
      await sendWhatsAppText(remoteJid.replace(/@.+$/, ""), answer);
    } catch (error) {
      await releaseWhatsAppEvent(providerMessageId);
      return Response.json({ error: error instanceof Error ? error.message : "No se pudo responder el mensaje." }, { status: 502 });
    }
  }
  return Response.json({ accepted: true }, { status: 202 });
}
