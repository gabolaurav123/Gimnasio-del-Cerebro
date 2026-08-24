import { getSettings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { EvolutionApiError, getConnectionState, getWhatsAppEnvironment } from "../../../lib/evolution-api";
import { WhatsAppAdmin } from "../../components/WhatsAppAdmin";

export default async function AdminWhatsAppPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [settings, environment] = await Promise.all([getSettings(), getWhatsAppEnvironment()]);
  let state = environment.missingProvider.length ? "not_configured" : "unknown";
  let providerError = "";
  if (!environment.missingProvider.length) {
    try { const payload = await getConnectionState(); const instance = payload.instance && typeof payload.instance === "object" ? payload.instance as Record<string, unknown> : {}; state = String(instance.state || payload.state || "unknown"); }
    catch (error) { state = error instanceof EvolutionApiError && error.status === 404 ? "not_created" : "provider_error"; providerError = error instanceof Error ? error.message : "No se pudo consultar WhatsApp."; }
  }
  const initialConnection = { configured: !environment.missingProvider.length, state, missing: environment.missingProvider, providerError, webhookReady: environment.webhookReady, openAiConfigured: environment.openAiConfigured, instanceName: environment.instanceName };
  return <><div className="admin-page-heading"><div><span>Comunicación conectada</span><h1>WhatsApp + IA</h1><p>Vincula el número, consulta chats y controla el asistente de respuestas automáticas.</p></div></div><WhatsAppAdmin settings={settings} initialConnection={initialConnection} /></>;
}
