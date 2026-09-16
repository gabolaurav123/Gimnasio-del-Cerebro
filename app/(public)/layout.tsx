import { PublicShell } from "../components/PublicShell";
import { getAssociates, getPublicNotifications, getSettings } from "../../db/repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, notifications, associates] = await Promise.all([getSettings(), getPublicNotifications(), getAssociates()]);
  return <PublicShell whatsapp={settings.whatsapp} notifications={notifications} associates={associates} neurofitness={{
    enabled: settings.neurofitnessEnabled === "true",
    campaignKey: settings.neurofitnessCampaignKey || "ccm-2026",
    frequency: (["session", "day", "always"].includes(settings.neurofitnessPopupFrequency) ? settings.neurofitnessPopupFrequency : "session") as "session" | "day" | "always",
    delayMs: Math.min(Math.max(Number(settings.neurofitnessPopupDelayMs || 1400), 0), 15000),
    eyebrow: settings.neurofitnessPopupEyebrow,
    title: settings.neurofitnessPopupTitle,
    description: settings.neurofitnessPopupDescription,
    cta: settings.neurofitnessPopupCta,
    eventLabel: settings.neurofitnessEventLabel,
    rankingLabel: settings.neurofitnessRankingLabel,
  }}>{children}</PublicShell>;
}
