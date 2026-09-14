import { getSettings, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { getOpenAIConfiguration } from "../../../lib/openai-config";
import { getWhatsAppStatus } from "../../../lib/whatsapp-bridge";
import { WhatsAppAdmin } from "../../components/WhatsAppAdmin";

export default async function AdminWhatsAppPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [settings, initialConnection, trainings, openAI] = await Promise.all([getSettings(), getWhatsAppStatus(), getTrainings(), getOpenAIConfiguration()]);
  return <><div className="admin-page-heading admin-page-heading--whatsapp"><div><span>Centro de atención y ventas</span><h1>WhatsApp + IA</h1><p>Estado, vinculación, conversaciones y comportamiento del asistente en un solo lugar.</p></div></div><WhatsAppAdmin settings={settings} initialConnection={initialConnection} campaigns={trainings.map(({ slug, name }) => ({ slug, name }))} openAIStatus={{ configured: openAI.configured, source: openAI.source }} openAIDefaultModel={settings.openAiDefaultModel} /></>;
}
