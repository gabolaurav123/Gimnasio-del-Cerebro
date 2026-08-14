import { z } from "zod";
import { createContact } from "../../../db/repository";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  country: z.string().trim().min(2).max(80),
  trainingInterest: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(1200),
});

export async function POST(request: Request) {
  try {
    const parsed = contactSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Revisa los campos e inténtalo nuevamente." }, { status: 400 });
    const id = await createContact(parsed.data);
    return Response.json({ id, message: "Recibimos tu consulta y quedó registrada para seguimiento." }, { status: 201 });
  } catch {
    return Response.json({ error: "No pudimos registrar la consulta. Inténtalo nuevamente." }, { status: 500 });
  }
}
