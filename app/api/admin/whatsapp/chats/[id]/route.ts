import { z } from "zod";
import { getWhatsAppConversation, getWhatsAppMessages, markWhatsAppConversationRead, setWhatsAppConversationMode } from "../../../../../../db/repository";
import { requestIsAdmin } from "../../../../../../lib/auth";

const schema = z.object({ mode: z.enum(["AI", "HUMAN"]) });

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await context.params;
  const conversation = await getWhatsAppConversation(id);
  if (!conversation) return Response.json({ error: "Conversación no encontrada." }, { status: 404 });
  const messages = await getWhatsAppMessages(id, 120);
  await markWhatsAppConversationRead(id);
  return Response.json({ conversation: { ...conversation, unreadCount: 0 }, messages }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Modo inválido." }, { status: 400 });
  const { id } = await context.params;
  const conversation = await setWhatsAppConversationMode(id, parsed.data.mode);
  if (!conversation) return Response.json({ error: "Conversación no encontrada." }, { status: 404 });
  return Response.json({ conversation }, { headers: { "cache-control": "no-store" } });
}
