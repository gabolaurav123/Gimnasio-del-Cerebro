import { z } from "zod";
import { appointmentSlotsForDate, getAppointmentAvailability } from "../../../../db/scheduling";

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), type: z.enum(["CONSULTATION", "TRAINING"]) });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = schema.safeParse({ date: url.searchParams.get("date"), type: url.searchParams.get("type") });
  if (!parsed.success) return Response.json({ error: "Fecha o tipo inválido." }, { status: 400 });
  const open = appointmentSlotsForDate(parsed.data.date).length > 0;
  return Response.json({
    slots: open ? await getAppointmentAvailability(parsed.data.date, parsed.data.type) : [],
    open,
    message: open ? undefined : "Ese día no hay atención. Elige martes, jueves o viernes.",
  }, { headers: { "cache-control": "no-store" } });
}
