import { z } from "zod";
import { addAssistantMessage, getAssistantMessages, getCustomerAssistant } from "../../../../db/customer-repository";
import { getRequestCustomer } from "../../../../lib/customer-auth";
import { getRuntimeValues } from "../../../../lib/runtime-env";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";

const schema = z.object({ assistantId: z.string().uuid(), message: z.string().trim().min(2).max(2000) });
const limit = { max: 30, windowMs: 60 * 60 * 1000, blockMs: 30 * 60 * 1000 };

async function safetyIdentifier(customerId: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`gdc:${customerId}`));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 64);
}

export async function POST(request: Request) {
  const customer = await getRequestCustomer(request);
  if (!customer) return Response.json({ error: "Inicia sesión para usar tu asistente." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Escribe una pregunta válida." }, { status: 400 });
  const key = rateLimitKey(request, "customer-assistant", customer.customerId);
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Alcanzaste el límite temporal. Intenta más tarde." }, { status: 429 });
  const profile = await getCustomerAssistant(customer.customerId, parsed.data.assistantId);
  if (!profile) return Response.json({ error: "Este asistente no está habilitado para tu cuenta." }, { status: 403 });
  const env = await getRuntimeValues(["OPENAI_API_KEY", "OPENAI_MODEL"]);
  if (!env.OPENAI_API_KEY) return Response.json({ error: "El administrador todavía no configuró OPENAI_API_KEY en el servidor." }, { status: 503 });
  const history = await getAssistantMessages(customer.customerId, profile.id, 14);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: profile.model || env.OPENAI_MODEL || "gpt-5.6-luna",
      store: false,
      max_output_tokens: 1200,
      safety_identifier: await safetyIdentifier(customer.customerId),
      instructions: `${profile.instructions}\n\nResponde en español claro y útil. Limítate al contenido educativo del programa ${profile.itemName}. No inventes hechos ni prometas resultados. No diagnostiques ni sustituyas atención médica o psicológica. Ante riesgo, crisis o posible emergencia, indica que se contacte a servicios de emergencia y profesionales habilitados.`,
      input: [...history.map((message) => ({ role: message.role, content: message.content })), { role: "user", content: parsed.data.message }],
    }),
  });
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
  if (!response.ok) {
    recordRateLimitFailure(key, limit);
    return Response.json({ error: payload.error?.message || "OpenAI no pudo responder en este momento." }, { status: 502 });
  }
  const reply = payload.output_text?.trim() || payload.output?.flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text || "").join("\n").trim();
  if (!reply) return Response.json({ error: "El asistente no devolvió una respuesta utilizable." }, { status: 502 });
  await addAssistantMessage(customer.customerId, profile.id, "user", parsed.data.message);
  await addAssistantMessage(customer.customerId, profile.id, "assistant", reply);
  return Response.json({ reply }, { headers: { "cache-control": "no-store" } });
}
