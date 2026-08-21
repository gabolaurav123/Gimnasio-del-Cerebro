import bcrypt from "bcryptjs";
import { z } from "zod";
import { countActiveSuperadmins, getAdminUserById, updateAdminUser } from "../../../../../db/repository";
import { getRequestAdmin } from "../../../../../lib/auth";

const schema = z.object({
  role: z.enum(["SUPERADMIN", "EDITOR", "COMERCIAL"]),
  active: z.boolean(),
  password: z.string().max(200).optional().default(""),
}).refine((value) => !value.password || value.password.length >= 12, { message: "La contraseña debe tener al menos 12 caracteres." });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getRequestAdmin(request, ["SUPERADMIN"]);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 });
  const id = (await context.params).id;
  const target = await getAdminUserById(id);
  if (!target) return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
  if (id === "bootstrap-superadmin") {
    return Response.json({ error: "La cuenta de recuperación se gestiona con las variables de Seenode." }, { status: 400 });
  }
  if (session.userId === id && (!parsed.data.active || parsed.data.role !== "SUPERADMIN")) {
    return Response.json({ error: "No puedes quitar tu propio acceso de superadministrador." }, { status: 400 });
  }
  if (target.role === "SUPERADMIN" && target.active && (!parsed.data.active || parsed.data.role !== "SUPERADMIN") && await countActiveSuperadmins() <= 1) {
    return Response.json({ error: "Debe permanecer al menos un superadministrador activo." }, { status: 400 });
  }
  await updateAdminUser(id, {
    role: parsed.data.role,
    active: parsed.data.active,
    passwordHash: parsed.data.password ? await bcrypt.hash(parsed.data.password, 12) : undefined,
  });
  return Response.json({ ok: true });
}
