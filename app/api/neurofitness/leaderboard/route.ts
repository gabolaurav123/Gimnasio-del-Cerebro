import { getNeurofitnessLeaderboard } from "../../../../db/neurofitness";
import { getSettingsReadOnly } from "../../../../db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettingsReadOnly();
    const entries = await getNeurofitnessLeaderboard(settings.neurofitnessCampaignKey || "ccm-2026", 10);
    return Response.json({ label: settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM", entries }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "No se pudo actualizar el ranking." }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
