import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminUser, getAdminUsers } from "../../../../db/repository";
import { requestIsAdmin } from "../../../../lib/auth";

const schema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(12).max(200),
  role: z.enum(["SUPERADMIN", "EDITOR", "COMERCIAL"]),
});

export async function GET(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const users = await getAdminUsers();
  return Response.json({ users: users.map((user) => ({ id: user.id, email: user.email, role: user.role, active: user.active, createdAt: user.createdAt })) }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await requestIsAdmin(request, ["SUPERADMIN"]))) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Usa un email válido y una contraseña de al menos 12 caracteres." }, { status: 400 });
  try {
    const id = await createAdminUser({ email: parsed.data.email, role: parsed.data.role, passwordHash: await bcrypt.hash(parsed.data.password, 12) });
    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Ese correo ya está registrado." }, { status: 409 });
  }
}
