import { z } from "zod";
import { createAppointmentBlock } from "../../../../../db/scheduling";
import { requestIsAdmin } from "../../../../../lib/auth";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  appointmentType: z.enum(["ALL", "CONSULTATION", "TRAINING"]),
  reason: z.string().trim().min(3).max(180),
}).refine((value) => value.endTime > value.startTime, { message: "La hora final debe ser posterior." });

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa la fecha y el rango horario." }, { status: 400 });
  return Response.json({ id: await createAppointmentBlock(parsed.data) }, { status: 201 });
}
