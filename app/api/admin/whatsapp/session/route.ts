import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { disconnectWhatsApp, reconnectWhatsApp, testWhatsAppConnection, WhatsAppBridgeError } from "../../../../../lib/whatsapp-bridge";

const schema = z.object({ action: z.enum(["test", "reconnect", "disconnect"]) });

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Acción inválida." }, { status: 400 });
  try {
    if (parsed.data.action === "test") return Response.json(await testWhatsAppConnection(), { headers: { "cache-control": "no-store" } });
    if (parsed.data.action === "reconnect") return Response.json(await reconnectWhatsApp(), { status: 202, headers: { "cache-control": "no-store" } });
    return Response.json(await disconnectWhatsApp(), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error instanceof WhatsAppBridgeError ? error.status : 502;
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo completar la acción." }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}
