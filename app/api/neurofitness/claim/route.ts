import { z } from "zod";
import { claimNeurofitnessAttempt, markNeurofitnessWhatsAppDelivery, NeurofitnessDataError } from "../../../../db/neurofitness";
import { getSettings } from "../../../../db/repository";
import { requestIsSameOrigin } from "../../../../lib/auth";
import { buildNeurofitnessWhatsAppMessage, sanitizePhone } from "../../../../lib/neurofitness";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";
import { getSiteOrigin } from "../../../../lib/site-url";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp-bridge";

const schema = z.object({
  id: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30),
  rankingAlias: z.string().trim().max(28).optional().default(""),
  resultConsent: z.literal(true),
  marketingConsent: z.boolean().default(false),
  rankingConsent: z.boolean().default(false),
  website: z.string().max(0).optional().default(""),
});
const limit = { max: 6, windowMs: 60 * 60 * 1000, blockMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Revisa tu nombre, WhatsApp y consentimiento." }, { status: 400 });
    const key = rateLimitKey(request, "neurofitness-claim", parsed.data.id);
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Se alcanzó el límite temporal de registros para este resultado." }, { status: 429 });
    const phone = sanitizePhone(parsed.data.phone);
    if (!phone || phone.length < 9) return Response.json({ error: "Ingresa un número de WhatsApp válido con código de país." }, { status: 400 });
    const settings = await getSettings();
    const claimed = await claimNeurofitnessAttempt({
      id: parsed.data.id,
      token: parsed.data.token,
      name: parsed.data.name,
      phone,
      rankingAlias: parsed.data.rankingAlias,
      marketingConsent: parsed.data.marketingConsent,
      rankingConsent: parsed.data.rankingConsent,
      sourceEvent: settings.neurofitnessEventLabel || "CCM",
    });

    let delivery: "sent" | "pending" | "failed" = claimed.whatsappDeliveryStatus === "SENT" ? "sent" : claimed.whatsappDeliveryStatus === "FAILED" ? "failed" : "pending";
    if (claimed.shouldSendWhatsApp) {
      const message = buildNeurofitnessWhatsAppMessage({
        name: parsed.data.name,
        scores: claimed.scores,
        rankingLabel: settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM",
        rank: claimed.rank,
        participantCount: claimed.participantCount,
        rankingScore: claimed.rankingScores.total,
        rewardLabel: settings.neurofitnessRewardLabel,
        rewardUrl: settings.neurofitnessRewardUrl,
        siteUrl: await getSiteOrigin(),
      });
      try {
        const sent = await sendWhatsAppMessage(`${phone}@s.whatsapp.net`, message);
        await markNeurofitnessWhatsAppDelivery({ participantId: claimed.participantId, attemptId: parsed.data.id, status: "SENT", messageId: sent.id });
        delivery = "sent";
      } catch (error) {
        await markNeurofitnessWhatsAppDelivery({ participantId: claimed.participantId, attemptId: parsed.data.id, status: "FAILED", error: error instanceof Error ? error.message : "Servicio no disponible" });
        delivery = "failed";
      }
    }
    recordRateLimitFailure(key, limit);
    return Response.json({
      profile: claimed.scores,
      rank: claimed.rank,
      participantCount: claimed.participantCount,
      rankingScore: claimed.rankingScores.total,
      isPersonalBest: claimed.isPersonalBest,
      rankingLabel: settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM",
      reward: settings.neurofitnessRewardLabel && settings.neurofitnessRewardUrl ? { label: settings.neurofitnessRewardLabel, url: settings.neurofitnessRewardUrl } : null,
      whatsappDelivery: delivery,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof NeurofitnessDataError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "No pudimos guardar tu perfil. Inténtalo nuevamente." }, { status: 500 });
  }
}
