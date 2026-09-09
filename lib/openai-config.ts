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

const OPENAI_SECRET_KEY = "openai_api_key";

async function runtimeValues(keys: string[]) {
  const { getRuntimeValues } = await import("./runtime-env");
  return getRuntimeValues(keys);
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function encryptionKey() {
  const runtime = await runtimeValues(["SESSION_SECRET"]);
  const secret = runtime.SESSION_SECRET?.trim() || "";
  if (secret.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres para guardar secretos de forma segura.");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`gdc-system-secrets:${secret}`));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function sealSecret(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(), new TextEncoder().encode(value));
  return `${encodeBase64Url(iv)}.${encodeBase64Url(new Uint8Array(encrypted))}`;
}

async function unsealSecret(value: string) {
  const [ivValue, encryptedValue] = value.split(".");
  if (!ivValue || !encryptedValue) throw new Error("El secreto guardado tiene un formato inválido.");
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64Url(ivValue) }, await encryptionKey(), decodeBase64Url(encryptedValue));
  return new TextDecoder().decode(decrypted);
}

async function getSecretDatabase() {
  const { ensureDatabase } = await import("../db/repository");
  return ensureDatabase();
}

async function storedOpenAIKey() {
  try {
    const db = await getSecretDatabase();
    const row = await db.prepare(`SELECT encrypted_value FROM system_secrets WHERE key = ? LIMIT 1`).bind(OPENAI_SECRET_KEY).first<{ encrypted_value: string }>();
    if (!row?.encrypted_value) return null;
    return getUsableOpenAIKey(await unsealSecret(row.encrypted_value));
  } catch (error) {
    console.error(JSON.stringify({ scope: "openai", event: "secret_read_error", error: error instanceof Error ? error.name : "unknown" }));
    return null;
  }
}

export type OpenAIKeySource = "panel" | "environment" | "none";

export async function getOpenAIConfiguration() {
  const stored = await storedOpenAIKey();
  if (stored) return { apiKey: stored, configured: true, source: "panel" as const };
  const runtime = await runtimeValues(["OPENAI_API_KEY"]);
  const environment = getUsableOpenAIKey(runtime.OPENAI_API_KEY);
  if (environment) return { apiKey: environment, configured: true, source: "environment" as const };
  return { apiKey: null, configured: false, source: "none" as const };
}

export async function saveOpenAIKey(value: string) {
  const apiKey = getUsableOpenAIKey(value);
  if (!apiKey) throw new Error("La clave de OpenAI no tiene un formato válido.");
  const db = await getSecretDatabase();
  const encrypted = await sealSecret(apiKey);
  await db.prepare(`INSERT INTO system_secrets (key, encrypted_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET encrypted_value = excluded.encrypted_value, updated_at = CURRENT_TIMESTAMP`)
    .bind(OPENAI_SECRET_KEY, encrypted).run();
}

export async function deleteOpenAIKey() {
  const db = await getSecretDatabase();
  await db.prepare(`DELETE FROM system_secrets WHERE key = ?`).bind(OPENAI_SECRET_KEY).run();
}

export async function testOpenAIKey(apiKey: string) {
  const key = getUsableOpenAIKey(apiKey);
  if (!key) return { ok: false, error: "La clave de OpenAI no tiene un formato válido." };
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) return { ok: true as const };
    if (response.status === 401) return { ok: false as const, error: "OpenAI rechazó la clave. Verifica que esté activa y completa." };
    if (response.status === 429) return { ok: false as const, error: "La cuenta de OpenAI no tiene capacidad disponible o alcanzó su límite." };
    return { ok: false as const, error: "OpenAI no pudo validar la clave en este momento." };
  } catch {
    return { ok: false as const, error: "No se pudo conectar con OpenAI. Inténtalo nuevamente." };
  }
}
