import { requestIsAdmin } from "../../../../../lib/auth";
import { findWhatsAppChats } from "../../../../../lib/evolution-api";

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try { return Response.json({ chats: await findWhatsAppChats() }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "No se pudieron cargar los chats." }, { status: 502 }); }
}
