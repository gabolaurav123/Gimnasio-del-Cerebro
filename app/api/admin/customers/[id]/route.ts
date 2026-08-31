import { z } from "zod";
import { setCustomerActive } from "../../../../../db/customer-repository";
import { requestIsAdmin } from "../../../../../lib/auth";

const schema = z.object({ active: z.boolean() });
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN", "COMERCIAL"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Estado inválido" }, { status: 400 });
  await setCustomerActive((await context.params).id, parsed.data.active);
  return Response.json({ ok: true });
}
