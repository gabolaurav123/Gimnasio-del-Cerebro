import { z } from "zod";
import { processIncomingWhatsApp } from "../../../../../lib/conversation-service";
import { getRuntimeValues } from "../../../../../lib/runtime-env";

const schema = z.object({
  providerMessageId: z.string().min(1).max(200),
  jid: z.string().min(5).max(180),
  phoneNumber: z.string().regex(/^\d{8,18}$/),
  contactName: z.string().trim().max(180).default(""),
  content: z.string().trim().min(1).max(4000),
  receivedAt: z.string().datetime(),
});

function secureEqual(left: string, right: string) {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function POST(request: Request) {
  const runtime = await getRuntimeValues(["WHATSAPP_BRIDGE_TOKEN"]);
  const expected = runtime.WHATSAPP_BRIDGE_TOKEN?.trim() || "";
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!secureEqual(received, expected)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 80 * 1024) return Response.json({ error: "Payload demasiado grande" }, { status: 413 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Mensaje inválido" }, { status: 400 });
  try {
    return Response.json(await processIncomingWhatsApp(parsed.data), { status: 202, headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ scope: "whatsapp", event: "inbound_error", error: error instanceof Error ? error.message.slice(0, 220) : "unknown" }));
    return Response.json({ error: "No se pudo procesar el mensaje entrante." }, { status: 502 });
  }
}
