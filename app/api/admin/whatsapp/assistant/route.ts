import { z } from "zod";
import { getSettings, updateSettings } from "../../../../../db/repository";
import { requestIsAdmin } from "../../../../../lib/auth";
import { getWhatsAppEnvironment } from "../../../../../lib/evolution-api";

const schema = z.object({ enabled: z.boolean(), model: z.string().trim().regex(/^[a-z0-9._-]+$/i).max(80), instructions: z.string().trim().min(30).max(6000) });

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const [settings, environment] = await Promise.all([getSettings(), getWhatsAppEnvironment()]);
  return Response.json({ enabled: settings.whatsappAiEnabled === "true", model: settings.whatsappAiModel, instructions: settings.whatsappAiInstructions, openAiConfigured: environment.openAiConfigured, webhookReady: environment.webhookReady });
}

export async function PATCH(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa el modelo y las instrucciones del asistente." }, { status: 400 });
  await updateSettings({ whatsappAiEnabled: String(parsed.data.enabled), whatsappAiModel: parsed.data.model, whatsappAiInstructions: parsed.data.instructions });
  const environment = await getWhatsAppEnvironment();
  return Response.json({ ok: true, ready: environment.openAiConfigured && environment.webhookReady });
}
