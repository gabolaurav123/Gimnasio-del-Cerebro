import { requestIsAdmin } from "../../../../../lib/auth";
import { getWhatsAppConversations } from "../../../../../db/repository";

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try { return Response.json({ chats: await getWhatsAppConversations() }, { headers: { "cache-control": "no-store" } }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los chats." }, { status: 502 }); }
}
