const knownPlaceholderKeys = new Set([
  "pega_aqui_tu_clave_de_openai",
  "your_openai_api_key",
  "openai_api_key",
  "changeme",
  "replace_me",
]);

export function getUsableOpenAIKey(value: string | undefined | null) {
  const key = value?.trim() || "";
  const normalized = key.toLowerCase().replace(/[\s-]+/g, "_");
  if (!key.startsWith("sk-") || key.length < 24 || knownPlaceholderKeys.has(normalized)) return null;
  return key;
}

export function hasUsableOpenAIKey(value: string | undefined | null) {
  return Boolean(getUsableOpenAIKey(value));
}
