import { z } from "zod";
import { getSettings, updateSettings } from "../../../../../db/repository";
import { requestIsAdmin } from "../../../../../lib/auth";
import { getWhatsAppStatus } from "../../../../../lib/whatsapp-bridge";

const schema = z.object({
  enabled: z.boolean(),
  model: z.string().trim().regex(/^[a-z0-9._-]+$/i).max(80),
  instructions: z.string().trim().min(30).max(6000),
  greeting: z.string().trim().min(10).max(700),
  handoffMessage: z.string().trim().min(10).max(700),
  responseDelayMs: z.coerce.number().int().min(0).max(5000),
  businessHours: z.string().trim().min(5).max(700),
  currentCampaignSlug: z.string().trim().regex(/^[a-z0-9-]*$/).max(180),
  catalogPath: z.string().trim().regex(/^\/(?!\/)[^\s]*$/).max(300),
});

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const [settings, connection] = await Promise.all([getSettings(), getWhatsAppStatus()]);
  return Response.json({
    enabled: settings.whatsappAiEnabled === "true",
    model: settings.whatsappAiModel,
    instructions: settings.whatsappAiInstructions,
    greeting: settings.whatsappAiGreeting,
    handoffMessage: settings.whatsappAiHandoffMessage,
    responseDelayMs: Number(settings.whatsappAiResponseDelayMs || 0),
    businessHours: settings.whatsappAiBusinessHours,
    currentCampaignSlug: settings.whatsappCurrentCampaignSlug,
    catalogPath: settings.whatsappCatalogPath,
    openAiConfigured: connection.openAiConfigured,
  }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa el modelo y las instrucciones del asistente." }, { status: 400 });
  await updateSettings({
    whatsappAiEnabled: String(parsed.data.enabled),
    whatsappAiModel: parsed.data.model,
    whatsappAiInstructions: parsed.data.instructions,
    whatsappAiGreeting: parsed.data.greeting,
    whatsappAiHandoffMessage: parsed.data.handoffMessage,
    whatsappAiResponseDelayMs: String(parsed.data.responseDelayMs),
    whatsappAiBusinessHours: parsed.data.businessHours,
    whatsappCurrentCampaignSlug: parsed.data.currentCampaignSlug,
    whatsappCatalogPath: parsed.data.catalogPath,
  });
  const connection = await getWhatsAppStatus();
  return Response.json({ ok: true, ready: connection.openAiConfigured });
}
