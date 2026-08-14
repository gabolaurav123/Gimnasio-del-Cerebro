import { z } from "zod";
import { authenticate, sessionCookie } from "../../../../lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(8).max(200) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Ingresa un correo y una contraseña válidos." }, { status: 400 });
  const token = await authenticate(parsed.data.email, parsed.data.password);
  if (!token) return Response.json({ error: "Credenciales incorrectas o acceso aún no configurado." }, { status: 401 });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", "set-cookie": sessionCookie(token) } });
}
