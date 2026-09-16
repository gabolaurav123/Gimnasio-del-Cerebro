import { z } from "zod";
import { completeNeurofitnessAttempt, NeurofitnessDataError } from "../../../../db/neurofitness";
import { requestIsSameOrigin } from "../../../../lib/auth";

const counter = z.number().int().min(0).max(120);
const reactionTimes = z.array(z.number().int().min(80).max(5000)).max(80);
const metricsSchema = z.object({
  focus: z.object({ correct: counter, incorrect: counter, reactionTimes }),
  control: z.object({ correct: counter, incorrect: counter, reactionTimes }),
  memory: z.object({ correct: counter.max(5), incorrect: counter.max(5) }),
  flexibility: z.object({ correct: counter, incorrect: counter, postSwitchCorrect: counter, postSwitchIncorrect: counter }),
}).superRefine((metrics, context) => {
  const limits = [
    ["focus", metrics.focus.correct + metrics.focus.incorrect, 40],
    ["control", metrics.control.correct + metrics.control.incorrect, 16],
    ["memory", metrics.memory.correct + metrics.memory.incorrect, 5],
    ["flexibility", metrics.flexibility.correct + metrics.flexibility.incorrect, 16],
  ] as const;
  for (const [domain, total, maximum] of limits) {
    if (total > maximum) context.addIssue({ code: "custom", path: [domain], message: "Cantidad de respuestas no válida." });
  }
  if (metrics.focus.correct + metrics.focus.incorrect < 3) context.addIssue({ code: "custom", path: ["focus"], message: "El desafío de foco quedó incompleto." });
  if (metrics.control.correct + metrics.control.incorrect < 8) context.addIssue({ code: "custom", path: ["control"], message: "El desafío de control quedó incompleto." });
  if (metrics.flexibility.correct + metrics.flexibility.incorrect < 9) context.addIssue({ code: "custom", path: ["flexibility"], message: "El desafío de flexibilidad quedó incompleto." });
  if (metrics.focus.reactionTimes.length !== metrics.focus.correct) context.addIssue({ code: "custom", path: ["focus", "reactionTimes"], message: "Tiempos de reacción no válidos." });
  if (metrics.control.reactionTimes.length !== metrics.control.correct) context.addIssue({ code: "custom", path: ["control", "reactionTimes"], message: "Tiempos de reacción no válidos." });
  if (metrics.memory.correct + metrics.memory.incorrect !== 5) context.addIssue({ code: "custom", path: ["memory"], message: "Respuestas de memoria incompletas." });
  if (metrics.flexibility.postSwitchCorrect > metrics.flexibility.correct || metrics.flexibility.postSwitchIncorrect > metrics.flexibility.incorrect) {
    context.addIssue({ code: "custom", path: ["flexibility"], message: "Respuestas posteriores al cambio no válidas." });
  }
});

const schema = z.object({
  id: z.string().uuid(),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  metrics: metricsSchema,
});

export async function POST(request: Request) {
  try {
    if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Los datos del reto no son válidos." }, { status: 400 });
    await completeNeurofitnessAttempt(parsed.data);
    return Response.json({ ready: true, message: "Tu perfil está listo. Regístrate para verlo." }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof NeurofitnessDataError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "No pudimos analizar tu reto. Inténtalo nuevamente." }, { status: 500 });
  }
}
