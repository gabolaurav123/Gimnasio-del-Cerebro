import { z } from "zod";
import { getWhatsAppConversation, recordWhatsAppOutgoing, setWhatsAppConversationMode } from "../../../../../db/repository";
import { requestIsAdmin } from "../../../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../../lib/rate-limit";
import { sendWhatsAppMessage } from "../../../../../lib/whatsapp-bridge";

const schema = z.object({ conversationId: z.string().uuid(), message: z.string().trim().min(1).max(3000) });
const limit = { max: 30, windowMs: 60 * 60 * 1000, blockMs: 30 * 60 * 1000 };

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const key = rateLimitKey(request, "whatsapp-manual");
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Se alcanzó el límite temporal de envíos." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Conversación o mensaje inválido." }, { status: 400 });
  try {
    const conversation = await getWhatsAppConversation(parsed.data.conversationId);
    if (!conversation) return Response.json({ error: "Conversación no encontrada." }, { status: 404 });
    await setWhatsAppConversationMode(conversation.id, "HUMAN");
    const sent = await sendWhatsAppMessage(conversation.jid, parsed.data.message);
    await recordWhatsAppOutgoing({ conversationId: conversation.id, providerMessageId: sent.id, content: parsed.data.message, senderType: "HUMAN", sentAt: sent.sentAt });
    return Response.json({ ok: true, message: { id: sent.id, sentAt: sent.sentAt } });
  }
  catch (error) { recordRateLimitFailure(key, limit); return Response.json({ error: error instanceof Error ? error.message : "No se pudo enviar el mensaje." }, { status: 502 }); }
}
