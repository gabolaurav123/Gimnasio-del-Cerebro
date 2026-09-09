import { z } from "zod";
import { updateSettings } from "../../../../db/repository";
import { requestIsAdmin } from "../../../../lib/auth";
import { deleteOpenAIKey, getOpenAIConfiguration, saveOpenAIKey, testOpenAIKey } from "../../../../lib/openai-config";
import { previewWhatsAppReply } from "../../../../lib/whatsapp-ai-service";

const saveSchema = z.object({
  apiKey: z.string().trim().max(300).optional(),
  model: z.string().trim().regex(/^[a-z0-9._-]+$/i).max(80),
});

const testSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("connection") }),
  z.object({ kind: z.literal("assistant"), message: z.string().trim().min(2).max(1200) }),
]);

function statusResponse(configuration: Awaited<ReturnType<typeof getOpenAIConfiguration>>) {
  return { configured: configuration.configured, source: configuration.source };
}

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(statusResponse(await getOpenAIConfiguration()), { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa la clave y el modelo de OpenAI." }, { status: 400 });
  if (parsed.data.apiKey) {
    const tested = await testOpenAIKey(parsed.data.apiKey);
    if (!tested.ok) return Response.json({ error: tested.error }, { status: 400 });
    await saveOpenAIKey(parsed.data.apiKey);
  }
  await updateSettings({ openAiDefaultModel: parsed.data.model });
  return Response.json({ ok: true, ...statusResponse(await getOpenAIConfiguration()) });
}

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = testSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Prueba inválida." }, { status: 400 });
  const configuration = await getOpenAIConfiguration();
  if (!configuration.apiKey) return Response.json({ error: "Primero guarda una clave válida de OpenAI." }, { status: 503 });
  if (parsed.data.kind === "connection") {
    const tested = await testOpenAIKey(configuration.apiKey);
    return Response.json(tested, { status: tested.ok ? 200 : 502 });
  }
  try {
    return Response.json({ ok: true, reply: await previewWhatsAppReply(parsed.data.message) });
  } catch {
    return Response.json({ error: "OpenAI no pudo generar la prueba. Revisa la clave, el modelo y el saldo de la cuenta." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  await deleteOpenAIKey();
  return Response.json({ ok: true, ...statusResponse(await getOpenAIConfiguration()) });
}
