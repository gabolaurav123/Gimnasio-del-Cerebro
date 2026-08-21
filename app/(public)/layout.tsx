import { PublicShell } from "../components/PublicShell";
import { getSettings } from "../../db/repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return <PublicShell whatsapp={settings.whatsapp}>{children}</PublicShell>;
}
