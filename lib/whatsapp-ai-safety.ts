export function normalizeWhatsAppReply(value: string) {
  const text = value.trim();
  if (text.length <= 2800) return text;
  const candidate = text.slice(0, 2799);
  const sentenceEnd = Math.max(candidate.lastIndexOf(". "), candidate.lastIndexOf("? "), candidate.lastIndexOf("! "));
  return `${(sentenceEnd >= 2100 ? candidate.slice(0, sentenceEnd + 1) : candidate).trimEnd()}…`;
}

export function isRetryableOpenAIStatus(status: number) {
  return [408, 409, 429, 500, 502, 503, 504].includes(status);
}

export function whatsAppGenerationOptions(model: string) {
  // These models default to medium reasoning, which can consume a short reply's
  // entire token budget before any text is returned to the person.
  return {
    max_output_tokens: 1200,
    ...(/^gpt-5\.6(?:[-.]|$)/.test(model) ? { reasoning: { effort: "none" as const } } : {}),
  };
}
