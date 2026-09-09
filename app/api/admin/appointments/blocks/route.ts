import { z } from "zod";
import { createAppointmentBlock } from "../../../../../db/scheduling";
import { requestIsAdmin } from "../../../../../lib/auth";

const schema = z.object({
  recurrence: z.enum(["DATE", "WEEKLY"]).default("DATE"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  weekdays: z.array(z.number().int().min(0).max(6)).max(7).optional().default([]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  appointmentType: z.enum(["ALL", "CONSULTATION", "TRAINING"]),
  reason: z.string().trim().min(3).max(180),
}).refine((value) => value.endTime > value.startTime, { message: "La hora final debe ser posterior." })
  .refine((value) => value.recurrence === "DATE" || value.weekdays.length > 0, { message: "Selecciona al menos un día semanal." })
  .refine((value) => !value.endDate || value.endDate >= value.date, { message: "La fecha final debe ser posterior a la inicial." });

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message || "Revisa la fecha y el rango horario." }, { status: 400 });
  const weekdays = parsed.data.recurrence === "WEEKLY" ? [...new Set(parsed.data.weekdays)] : [null];
  const ids: string[] = [];
  for (const weekday of weekdays) {
    ids.push(await createAppointmentBlock({
      date: parsed.data.date,
      endDate: parsed.data.endDate || null,
      recurrence: parsed.data.recurrence,
      weekday,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      appointmentType: parsed.data.appointmentType,
      reason: parsed.data.reason,
    }));
  }
  return Response.json({ ids }, { status: 201 });
}
