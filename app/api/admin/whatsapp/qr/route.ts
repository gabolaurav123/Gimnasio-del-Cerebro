import { requestIsAdmin } from "../../../../../lib/auth";
import { createWhatsAppQr, EvolutionApiError } from "../../../../../lib/evolution-api";

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  try {
    const result = await createWhatsAppQr();
    if (!result.qr && !result.pairingCode) return Response.json({ error: "Evolution API no devolvió un QR. Revisa si la instancia ya está conectada." }, { status: 409 });
    return Response.json(result);
  } catch (error) {
    const status = error instanceof EvolutionApiError ? error.status : 502;
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo generar el QR." }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}
