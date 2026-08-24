import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { updateAppointmentStatus } from "../../../../../db/repository";

const schema = z.object({ status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Estado inválido" }, { status: 400 });
  await updateAppointmentStatus((await context.params).id, parsed.data.status);
  return Response.json({ ok: true });
}
