import type { Metadata } from "next";
import { NeurofitnessLeaderboard } from "../../components/NeurofitnessLeaderboard";
import { getNeurofitnessLeaderboard } from "../../../db/neurofitness";
import { getSettings } from "../../../db/repository";

export const metadata: Metadata = { title: "Ranking del Reto Neurofitness", description: "Top 10 en vivo del Reto Neurofitness.", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NeurofitnessRankingPage() {
  const settings = await getSettings();
  const label = settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM";
  const entries = await getNeurofitnessLeaderboard(settings.neurofitnessCampaignKey || "ccm-2026", 10);
  return <NeurofitnessLeaderboard initialLabel={label} initialEntries={entries} />;
}
