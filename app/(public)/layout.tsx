import { PublicShell } from "../components/PublicShell";
import { getAssociates, getPublicNotifications, getSettings } from "../../db/repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, notifications, associates] = await Promise.all([getSettings(), getPublicNotifications(), getAssociates()]);
  return <PublicShell whatsapp={settings.whatsapp} notifications={notifications} associates={associates}>{children}</PublicShell>;
}
