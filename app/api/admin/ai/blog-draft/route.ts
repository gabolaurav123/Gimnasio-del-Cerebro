import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { getRuntimeValues } from "../../../../../lib/runtime-env";
import { checkRateLimit, rateLimitKey, recordRateLimitFailure } from "../../../../../lib/rate-limit";

const schema = z.object({
  title: z.string().trim().min(5).max(220),
  category: z.string().trim().min(2).max(80),
  brief: z.string().trim().min(10).max(2000),
});

const limit = { max: 8, windowMs: 60 * 60 * 1000, blockMs: 30 * 60 * 1000 };

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Completa el título, la categoría y una guía de al menos 10 caracteres." }, { status: 400 });
  const key = rateLimitKey(request, "openai-blog");
  const allowed = checkRateLimit(key, limit);
  if (!allowed.allowed) return Response.json({ error: "Se alcanzó el límite temporal del asistente. Intenta más tarde." }, { status: 429, headers: { "retry-after": String(allowed.retryAfter) } });
  const env = await getRuntimeValues(["OPENAI_API_KEY", "OPENAI_MODEL"]);
  if (!env.OPENAI_API_KEY) return Response.json({ error: "Falta configurar OPENAI_API_KEY en el servidor." }, { status: 503 });
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5-mini",
      store: false,
      max_output_tokens: 2200,
      instructions: "Eres el asistente editorial de Gimnasio del Cerebro. Redacta en español claro, responsable y cercano. No inventes certificaciones, cifras, testimonios ni afirmaciones médicas. Devuelve únicamente párrafos de texto plano, sin Markdown ni título, y termina con una invitación prudente a reflexionar o conocer los entrenamientos.",
      input: `Título: ${parsed.data.title}\nCategoría: ${parsed.data.category}\nGuía editorial: ${parsed.data.brief}`,
    }),
  });
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
  if (!response.ok) {
    recordRateLimitFailure(key, limit);
    return Response.json({ error: payload.error?.message || "OpenAI no pudo generar el borrador." }, { status: 502 });
  }
  const draft = payload.output_text?.trim() || payload.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n").trim();
  if (!draft) return Response.json({ error: "OpenAI no devolvió contenido utilizable." }, { status: 502 });
  return Response.json({ draft });
}
