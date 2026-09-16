const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(left: string, right: string) {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function sha256(value: string) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string, nowMs = Date.now()) {
  if (!signatureHeader || !secret.startsWith("whsec_")) return false;
  const parts = signatureHeader.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key, value]) => key === "v1" && value).map(([, value]) => value);
  if (!Number.isFinite(timestamp) || !signatures.length || Math.abs(Math.floor(nowMs / 1000) - timestamp) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => timingSafeEqual(expected, signature));
}

export function verifyHotmartToken(received: string | null | undefined, expected: string | null | undefined) {
  const actual = received?.trim() || "";
  const configured = expected?.trim() || "";
  return configured.length >= 16 && timingSafeEqual(actual, configured);
}
