import { z } from "zod";
import { requestIsAdmin } from "../../../../lib/auth";
import { createTraining, getTrainings } from "../../../../db/repository";
const schema = z.object({ name: z.string().trim().min(3).max(150), acronym: z.string().trim().min(2).max(10), slug: z.string().regex(/^[a-z0-9-]+$/), shortDescription: z.string().trim().min(10).max(500) });
export async function GET(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); return Response.json({ trainings: await getTrainings(true) }); }
export async function POST(request: Request) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 }); return Response.json({ id: await createTraining(parsed.data) }, { status: 201 }); }
