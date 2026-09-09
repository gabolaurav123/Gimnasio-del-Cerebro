import { getSettings, getTrainings } from "../../../db/repository";
import { requireAdminRole } from "../../../lib/admin-access";
import { getWhatsAppStatus } from "../../../lib/whatsapp-bridge";
import { WhatsAppAdmin } from "../../components/WhatsAppAdmin";

export default async function AdminWhatsAppPage() {
  await requireAdminRole(["SUPERADMIN"]);
  const [settings, initialConnection, trainings] = await Promise.all([getSettings(), getWhatsAppStatus(), getTrainings()]);
  return <><div className="admin-page-heading"><div><span>Centro de atención y ventas</span><h1>WhatsApp + IA</h1><p>Vincula el número con un QR, conversa con tus contactos y decide cuándo responde la IA o una persona.</p></div></div><WhatsAppAdmin settings={settings} initialConnection={initialConnection} campaigns={trainings.map(({ slug, name }) => ({ slug, name }))} /></>;
}
