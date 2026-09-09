import { requestIsAdmin } from "../../../../../lib/auth";
import { startWhatsAppLink, WhatsAppBridgeError } from "../../../../../lib/whatsapp-bridge";

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    return Response.json(await startWhatsAppLink(), { status: 202, headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof WhatsAppBridgeError ? error.status : 502;
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo iniciar la vinculación." }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}
