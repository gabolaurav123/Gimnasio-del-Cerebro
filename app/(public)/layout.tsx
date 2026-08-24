import { PublicShell } from "../components/PublicShell";
import { getPublicNotifications, getSettings } from "../../db/repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, notifications] = await Promise.all([getSettings(), getPublicNotifications()]);
  return <PublicShell whatsapp={settings.whatsapp} notifications={notifications}>{children}</PublicShell>;
}
