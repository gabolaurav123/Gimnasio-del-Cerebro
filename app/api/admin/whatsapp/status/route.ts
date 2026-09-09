import { requestIsAdmin } from "../../../../../lib/auth";
import { getWhatsAppStatus } from "../../../../../lib/whatsapp-bridge";

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getWhatsAppStatus(), { headers: { "cache-control": "no-store" } });
}
