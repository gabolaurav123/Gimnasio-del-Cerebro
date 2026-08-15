type RuntimeValues = Record<string, string | undefined>;

function nodeValues(): RuntimeValues {
  return typeof process !== "undefined" ? process.env : {};
}

async function cloudflareValues(): Promise<RuntimeValues> {
  try {
    const { env } = await import("cloudflare:workers");
    return env as unknown as RuntimeValues;
  } catch {
    return {};
  }
}

export async function getRuntimeValues(keys: string[]) {
  const local = nodeValues();
  const missing = keys.some((key) => !local[key]);
  if (!missing) return local;
  return { ...(await cloudflareValues()), ...local };
}

export function getDatabaseUrl() {
  const values = nodeValues();
  return values.DATABASE_URL?.trim() || values.POSTGRES_URL?.trim() || "";
}

export async function getCloudflareBindings() {
  try {
    const { env } = await import("cloudflare:workers");
    return env as unknown as { DB?: D1Database; MEDIA?: R2Bucket };
  } catch {
    return {};
  }
}
