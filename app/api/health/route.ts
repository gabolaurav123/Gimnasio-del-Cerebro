import { getDatabase } from "../../../db/repository";
import { getRuntimeValues } from "../../../lib/runtime-env";
import { getSiteOrigin } from "../../../lib/site-url";

export const dynamic = "force-dynamic";

function safeError(error: unknown) {
  const value = error as { name?: unknown; code?: unknown; message?: unknown };
  return {
    name: typeof value?.name === "string" ? value.name : "Error",
    code: typeof value?.code === "string" ? value.code : null,
    message: typeof value?.message === "string"
      ? value.message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[database-url]").slice(0, 240)
      : "Error desconocido",
  };
}

export async function GET() {
  const checks: Record<string, unknown> = {};
  try {
    const runtime = await getRuntimeValues(["DATABASE_URL", "SITE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_PASSWORD_HASH", "SESSION_SECRET"]);
    checks.environment = {
      database: Boolean(runtime.DATABASE_URL || runtime.POSTGRES_URL),
      siteUrl: Boolean(runtime.SITE_URL),
      adminEmail: Boolean(runtime.ADMIN_EMAIL),
      adminHashValid: /^\$2[aby]\$\d{2}\$/.test(runtime.ADMIN_PASSWORD_HASH ?? ""),
      adminPasswordConfigured: (runtime.ADMIN_PASSWORD?.trim().length ?? 0) >= 8,
      adminCredentialConfigured: /^\$2[aby]\$\d{2}\$/.test(runtime.ADMIN_PASSWORD_HASH ?? "") || (runtime.ADMIN_PASSWORD?.trim().length ?? 0) >= 8 || (runtime.ADMIN_PASSWORD_HASH?.trim().length ?? 0) >= 8,
      sessionSecretValid: (runtime.SESSION_SECRET?.length ?? 0) >= 32,
    };
  } catch (error) {
    checks.environment = { ok: false, error: safeError(error) };
  }

  try {
    checks.siteOrigin = { ok: true, value: await getSiteOrigin() };
  } catch (error) {
    checks.siteOrigin = { ok: false, error: safeError(error) };
  }

  try {
    const database = await getDatabase();
    const result = await database.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    checks.database = { ok: Number(result?.ok ?? 0) === 1, dialect: database.dialect };
  } catch (error) {
    checks.database = { ok: false, error: safeError(error) };
  }

  return Response.json({ status: "ok", checks }, { headers: { "cache-control": "no-store" } });
}
