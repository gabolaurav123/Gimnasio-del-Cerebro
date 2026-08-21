import { z } from "zod";
import { requestIsAdmin } from "../../../../lib/auth";
import { defaultSettings, getSettings, updateSettings } from "../../../../db/repository";
const schema = z.record(z.enum(Object.keys(defaultSettings) as [string, ...string[]]), z.string().max(1200));
export async function GET(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); return Response.json({ settings: await getSettings() }); }
export async function PATCH(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 }); await updateSettings(parsed.data); return Response.json({ ok: true }); }
