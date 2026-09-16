export const NEUROFITNESS_VERSION = 1;
export const NEUROFITNESS_CONSENT_VERSION = "neurofitness-2026-09";

export const neurofitnessDomains = ["focus", "control", "memory", "flexibility"] as const;
export type NeurofitnessDomain = (typeof neurofitnessDomains)[number];

export type NeurofitnessRawMetrics = {
  focus: { correct: number; incorrect: number; reactionTimes: number[] };
  control: { correct: number; incorrect: number; reactionTimes: number[] };
  memory: { correct: number; incorrect: number };
  flexibility: { correct: number; incorrect: number; postSwitchCorrect: number; postSwitchIncorrect: number };
};

export type NeurofitnessScores = {
  focus: number;
  control: number;
  memory: number;
  flexibility: number;
  total: number;
  bestDomain: NeurofitnessDomain;
};

export const neurofitnessDomainLabels: Record<NeurofitnessDomain, string> = {
  focus: "FOCO",
  control: "CONTROL",
  memory: "MEMORIA",
  flexibility: "FLEXIBILIDAD",
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum);
}

function accuracy(correct: number, incorrect: number) {
  const total = correct + incorrect;
  return total > 0 ? correct / total : 0;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = values.filter(Number.isFinite).map((value) => Math.max(0, value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function calculateNeurofitnessScores(metrics: NeurofitnessRawMetrics): NeurofitnessScores {
  const focusTotal = metrics.focus.correct + metrics.focus.incorrect;
  const focusHitRate = focusTotal ? metrics.focus.correct / focusTotal : 0;
  const focusFalseAlarmRate = focusTotal ? metrics.focus.incorrect / focusTotal : 0;
  const focusDiscrimination = clamp(focusHitRate - focusFalseAlarmRate);
  const focusMedian = median(metrics.focus.reactionTimes);
  const focusSpeed = focusMedian ? clamp((850 - focusMedian) / 600) : 0;
  const focus = Math.round(85 * focusDiscrimination + 15 * focusSpeed * focusDiscrimination);

  const controlAccuracy = accuracy(metrics.control.correct, metrics.control.incorrect);
  const controlMedian = median(metrics.control.reactionTimes);
  const controlSpeed = controlMedian ? clamp((1600 - controlMedian) / 1100) : 0;
  const control = Math.round(90 * controlAccuracy + 10 * controlSpeed * controlAccuracy);

  const memory = Math.round(100 * accuracy(metrics.memory.correct, metrics.memory.incorrect));

  const flexibilityAccuracy = accuracy(metrics.flexibility.correct, metrics.flexibility.incorrect);
  const postSwitchAccuracy = accuracy(metrics.flexibility.postSwitchCorrect, metrics.flexibility.postSwitchIncorrect);
  const flexibility = Math.round(80 * flexibilityAccuracy + 20 * postSwitchAccuracy);

  const bounded = {
    focus: Math.round(clamp(focus, 0, 100)),
    control: Math.round(clamp(control, 0, 100)),
    memory: Math.round(clamp(memory, 0, 100)),
    flexibility: Math.round(clamp(flexibility, 0, 100)),
  };
  const total = Math.round((bounded.focus + bounded.control + bounded.memory + bounded.flexibility) / 4);
  const bestDomain = neurofitnessDomains.reduce((best, domain) => bounded[domain] > bounded[best] ? domain : best, "focus" as NeurofitnessDomain);
  return { ...bounded, total, bestDomain };
}

export function sanitizePhone(input: string) {
  if (!/^(?:\+|00)/.test(input.trim())) return "";
  const normalized = input.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15 ? digits : "";
}

export function safeRankingName(name: string, alias?: string | null) {
  const preferred = alias?.trim().replace(/[^\p{L}\p{N} ._'’-]/gu, "").slice(0, 28);
  if (preferred) return preferred;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Participante";
  return `${parts[0]}${parts[1] ? ` ${parts[1][0].toUpperCase()}.` : ""}`.slice(0, 28);
}

export async function sha256Hex(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function buildNeurofitnessWhatsAppMessage(input: {
  name: string;
  scores: NeurofitnessScores;
  rankingLabel: string;
  rank: number | null;
  participantCount: number;
  rankingScore?: number;
  rewardLabel?: string;
  rewardUrl?: string;
  siteUrl: string;
}) {
  const firstName = input.name.trim().split(/\s+/)[0] || "Hola";
  const lines = [
    `🧠 ${firstName}, este es tu Perfil Neurofitness`,
    "",
    `FOCO: ${input.scores.focus}`,
    `CONTROL: ${input.scores.control}`,
    `MEMORIA: ${input.scores.memory}`,
    `FLEXIBILIDAD: ${input.scores.flexibility}`,
    "",
    `Puntuación del Reto Neurofitness: ${input.scores.total}/100`,
    `Tu mejor desempeño de hoy fue ${neurofitnessDomainLabels[input.scores.bestDomain]}.`,
  ];
  if (input.rank) {
    const scoreContext = input.rankingScore !== undefined && input.rankingScore !== input.scores.total ? ` con tu mejor marca de ${input.rankingScore}/100` : "";
    lines.push("", `🔥 Puesto #${input.rank} de ${input.participantCount} participantes en ${input.rankingLabel}${scoreContext}.`);
  }
  lines.push("", "Estas capacidades pueden ejercitarse. Este resultado es lúdico y orientativo; no constituye una evaluación médica ni neuropsicológica.");
  if (input.rewardLabel && input.rewardUrl) lines.push("", `🎁 ${input.rewardLabel}`, input.rewardUrl);
  else lines.push("", `Descubre cómo seguir entrenando: ${input.siteUrl.replace(/\/$/, "")}/entrenamientos`);
  return lines.join("\n");
}
