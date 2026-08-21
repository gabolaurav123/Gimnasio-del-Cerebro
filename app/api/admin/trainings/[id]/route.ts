import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { setTrainingStatus } from "../../../../../db/repository";
const schema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]) });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 }); await setTrainingStatus((await context.params).id, parsed.data.status); return Response.json({ ok: true }); }
