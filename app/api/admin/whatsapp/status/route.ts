import { requestIsAdmin } from "../../../../../lib/auth";
import { EvolutionApiError, getConnectionState, getWhatsAppEnvironment } from "../../../../../lib/evolution-api";

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const environment = await getWhatsAppEnvironment();
  if (environment.missingProvider.length) return Response.json({ configured: false, state: "not_configured", missing: environment.missingProvider, webhookReady: environment.webhookReady, openAiConfigured: environment.openAiConfigured, instanceName: environment.instanceName });
  try {
    const payload = await getConnectionState();
    const instance = payload.instance && typeof payload.instance === "object" ? payload.instance as Record<string, unknown> : {};
    return Response.json({ configured: true, state: String(instance.state || payload.state || "unknown"), webhookReady: environment.webhookReady, openAiConfigured: environment.openAiConfigured, instanceName: environment.instanceName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo consultar WhatsApp.";
    const state = error instanceof EvolutionApiError && error.status === 404 ? "not_created" : "provider_error";
    return Response.json({ configured: true, state, providerError: message, webhookReady: environment.webhookReady, openAiConfigured: environment.openAiConfigured, instanceName: environment.instanceName });
  }
}
