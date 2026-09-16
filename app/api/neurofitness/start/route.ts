import { createNeurofitnessAttempt } from "../../../../db/neurofitness";
import { getSettings } from "../../../../db/repository";
import { requestIsSameOrigin } from "../../../../lib/auth";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../lib/rate-limit";

const limit = { max: 1200, windowMs: 60 * 60 * 1000, blockMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const key = rateLimitKey(request, "neurofitness-start");
    const allowed = checkRateLimit(key, limit);
    if (!allowed.allowed) return Response.json({ error: "Hay demasiados intentos en curso. Espera un momento." }, { status: 429 });
    const settings = await getSettings();
    const attempt = await createNeurofitnessAttempt(settings.neurofitnessCampaignKey || "ccm-2026");
    recordRateLimitFailure(key, limit);
    return Response.json({ attempt }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos iniciar el reto. Inténtalo nuevamente." }, { status: 500 });
  }
}
