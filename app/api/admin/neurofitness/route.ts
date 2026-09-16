import { z } from "zod";
import { getSettings, getTrainings, updateSettings } from "../../../../db/repository";
import { requestIsAdmin } from "../../../../lib/auth";

const schema = z.object({
  enabled: z.boolean(),
  campaignKey: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  popupFrequency: z.enum(["session", "day", "always"]),
  popupDelayMs: z.number().int().min(0).max(15000),
  popupEyebrow: z.string().trim().min(2).max(80),
  popupTitle: z.string().trim().min(2).max(100),
  popupDescription: z.string().trim().min(10).max(320),
  popupCta: z.string().trim().min(2).max(60),
  eventLabel: z.string().trim().min(2).max(100),
  rankingLabel: z.string().trim().min(2).max(100),
  rewardTrainingId: z.string().trim().max(100),
  rewardLabel: z.string().trim().max(120),
  rewardUrl: z.union([z.literal(""), z.string().url().max(500).refine((value) => {
    try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
  }, "El enlace debe usar HTTP o HTTPS.")]),
}).superRefine((value, context) => {
  if (Boolean(value.rewardLabel) !== Boolean(value.rewardUrl)) {
    context.addIssue({ code: "custom", path: [value.rewardLabel ? "rewardUrl" : "rewardLabel"], message: "Completa tanto el nombre como el enlace del regalo." });
  }
});

export async function PATCH(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa los datos de la campaña." }, { status: 400 });
  if (parsed.data.rewardTrainingId) {
    const trainingExists = (await getTrainings(true)).some((training) => training.id === parsed.data.rewardTrainingId);
    if (!trainingExists) return Response.json({ error: "El entrenamiento de regalo seleccionado ya no existe." }, { status: 400 });
  }
  await updateSettings({
    neurofitnessEnabled: String(parsed.data.enabled),
    neurofitnessCampaignKey: parsed.data.campaignKey,
    neurofitnessPopupFrequency: parsed.data.popupFrequency,
    neurofitnessPopupDelayMs: String(parsed.data.popupDelayMs),
    neurofitnessPopupEyebrow: parsed.data.popupEyebrow,
    neurofitnessPopupTitle: parsed.data.popupTitle,
    neurofitnessPopupDescription: parsed.data.popupDescription,
    neurofitnessPopupCta: parsed.data.popupCta,
    neurofitnessEventLabel: parsed.data.eventLabel,
    neurofitnessRankingLabel: parsed.data.rankingLabel,
    neurofitnessRewardTrainingId: parsed.data.rewardTrainingId,
    neurofitnessRewardLabel: parsed.data.rewardLabel,
    neurofitnessRewardUrl: parsed.data.rewardUrl,
  });
  return Response.json({ ok: true, settings: await getSettings() });
}
