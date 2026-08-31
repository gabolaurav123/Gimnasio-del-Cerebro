import { z } from "zod";
import { upsertAssistantProfile } from "../../../../db/customer-repository";
import { requestIsAdmin } from "../../../../lib/auth";

const schema = z.object({ itemType: z.enum(["PRODUCT", "TRAINING"]), itemId: z.string().min(1).max(100), name: z.string().trim().min(3).max(120), instructions: z.string().trim().min(20).max(8000), model: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(80), enabled: z.boolean() });
export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Revisa los datos del asistente." }, { status: 400 });
  return Response.json({ id: await upsertAssistantProfile(parsed.data) });
}
