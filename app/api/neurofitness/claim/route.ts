import bcrypt from "bcryptjs";
import { z } from "zod";
import { createCustomer, getCustomerByEmail, getCustomerById, setCustomerEntitlement } from "../../../../db/customer-repository";
import { claimNeurofitnessAttempt, markNeurofitnessWhatsAppDelivery, NeurofitnessDataError } from "../../../../db/neurofitness";
import { getSettings, getTrainings } from "../../../../db/repository";
import { requestIsSameOrigin } from "../../../../lib/auth";
import { authenticateCustomer, customerSessionCookie, getRequestCustomer } from "../../../../lib/customer-auth";
import { buildNeurofitnessWhatsAppMessage, sanitizePhone } from "../../../../lib/neurofitness";
import { checkRateLimit, clearRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";
import { getRuntimeValues } from "../../../../lib/runtime-env";
import { getSiteOrigin } from "../../../../lib/site-url";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp-bridge";

const passwordSchema = z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/);
const schema = z.object({
  id: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30),
  country: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().email().max(180),
  password: z.string().max(128).optional().default(""),
  acceptedTerms: z.boolean().default(false),
  acceptedPrivacy: z.boolean().default(false),
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
    if (!parsed.success) return Response.json({ error: "Revisa tu nombre, WhatsApp, correo y consentimientos." }, { status: 400 });
    const email = parsed.data.email.toLowerCase();
    const key = rateLimitKey(request, "neurofitness-claim", `${parsed.data.id}:${email}`);
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Se alcanzó el límite temporal de registros para este resultado." }, { status: 429 });
    const phone = sanitizePhone(parsed.data.phone);
    if (!phone || phone.length < 9) return Response.json({ error: "Ingresa un número de WhatsApp válido con código de país." }, { status: 400 });
    const currentSession = await getRequestCustomer(request);
    if (!currentSession && (!parsed.data.acceptedTerms || !parsed.data.acceptedPrivacy || !passwordSchema.safeParse(parsed.data.password).success)) {
      return Response.json({ error: "Para crear tu cuenta, acepta los términos y la privacidad. La contraseña debe tener 10 caracteres, mayúscula, minúscula y número." }, { status: 400 });
    }

    let customer = currentSession ? await getCustomerById(currentSession.customerId) : await getCustomerByEmail(email);
    let sessionToken: string | null = null;
    let accountCreated = false;
    if (currentSession && (!customer || customer.email !== email)) {
      return Response.json({ error: "Tu sesión no coincide con el correo indicado. Recarga la página e inténtalo nuevamente." }, { status: 409 });
    }
    if (!currentSession && customer) {
      sessionToken = await authenticateCustomer(email, parsed.data.password);
      if (!sessionToken) {
        recordRateLimitFailure(key, limit);
        return Response.json({ error: "Ese correo ya tiene una cuenta. Ingresa la contraseña correcta para guardar allí tu resultado y regalo." }, { status: 401 });
      }
    }

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

    if (!customer) {
      const runtime = await getRuntimeValues(["TERMS_VERSION"]);
      try {
        customer = await createCustomer({
          name: parsed.data.name,
          email,
          passwordHash: await bcrypt.hash(parsed.data.password, 12),
          phone,
          country: parsed.data.country || null,
          termsVersion: runtime.TERMS_VERSION || "2026-08-31",
        });
        accountCreated = true;
      } catch (error) {
        customer = await getCustomerByEmail(email);
        if (!customer) throw error;
      }
      sessionToken = await authenticateCustomer(email, parsed.data.password);
      if (!customer || !sessionToken) throw new Error("No pudimos iniciar la sesión de la cuenta recién creada.");
    }

    const rewardTrainingId = settings.neurofitnessRewardTrainingId?.trim() || "";
    const rewardTraining = rewardTrainingId
      ? (await getTrainings(true)).find((training) => training.id === rewardTrainingId) || null
      : null;
    if (rewardTraining) {
      await setCustomerEntitlement({ customerId: customer.id, itemType: "TRAINING", itemId: rewardTraining.id, active: true });
    }

    let delivery: "sent" | "pending" | "failed" = claimed.whatsappDeliveryStatus === "SENT" ? "sent" : claimed.whatsappDeliveryStatus === "FAILED" ? "failed" : "pending";
    if (claimed.shouldSendWhatsApp) {
      const siteUrl = await getSiteOrigin();
      const message = buildNeurofitnessWhatsAppMessage({
        name: parsed.data.name,
        scores: claimed.scores,
        rankingLabel: settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM",
        rank: claimed.rank,
        participantCount: claimed.participantCount,
        rankingScore: claimed.rankingScores.total,
        rewardLabel: rewardTraining?.name || settings.neurofitnessRewardLabel,
        rewardUrl: rewardTraining ? `${siteUrl}/mi-cuenta` : settings.neurofitnessRewardUrl,
        siteUrl,
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
    clearRateLimit(key);
    const responseHeaders: Record<string, string> = { "cache-control": "no-store" };
    if (sessionToken) responseHeaders["set-cookie"] = customerSessionCookie(sessionToken);
    return Response.json({
      profile: claimed.scores,
      rank: claimed.rank,
      participantCount: claimed.participantCount,
      rankingScore: claimed.rankingScores.total,
      isPersonalBest: claimed.isPersonalBest,
      rankingLabel: settings.neurofitnessRankingLabel || "NEUROFITNESS LIVE · CCM",
      reward: settings.neurofitnessRewardLabel && settings.neurofitnessRewardUrl ? { label: settings.neurofitnessRewardLabel, url: settings.neurofitnessRewardUrl } : null,
      account: {
        created: accountCreated,
        email: customer.email,
        profileUrl: "/mi-cuenta",
        gift: rewardTraining ? { id: rewardTraining.id, name: rewardTraining.name } : null,
      },
      whatsappDelivery: delivery,
    }, { headers: responseHeaders });
  } catch (error) {
    if (error instanceof NeurofitnessDataError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "No pudimos guardar tu perfil. Inténtalo nuevamente." }, { status: 500 });
  }
}
