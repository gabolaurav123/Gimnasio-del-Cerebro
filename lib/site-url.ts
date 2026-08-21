import { getRuntimeValues } from "./runtime-env";

const FALLBACK_SITE_URL = "https://gimnasio-del-cerebro.gabolaurav2.chatgpt.site";

export async function getSiteOrigin() {
  const values = await getRuntimeValues(["SITE_URL"]);
  const candidate = values.SITE_URL?.trim();
  if (!candidate) return FALLBACK_SITE_URL;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return FALLBACK_SITE_URL;
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}
