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
