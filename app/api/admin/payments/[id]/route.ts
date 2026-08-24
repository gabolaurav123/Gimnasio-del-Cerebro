import { z } from "zod";
import { updatePaymentStatus } from "../../../../../db/repository";
import { getRequestAdmin } from "../../../../../lib/auth";

const schema = z.object({ status: z.enum(["PENDING", "VERIFIED", "REJECTED", "REFUNDED"]) });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getRequestAdmin(request, ["SUPERADMIN", "COMERCIAL"]);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Estado inválido" }, { status: 400 });
  await updatePaymentStatus((await context.params).id, parsed.data.status, session.email);
  return Response.json({ ok: true });
}
