import { z } from "zod";
import { requestIsAdmin } from "../../../../../lib/auth";
import { setTrainingStatus, updateTraining } from "../../../../../db/repository";
const schema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN"]) });
const asset = z.string().trim().max(500).refine((value) => !value || /^\/(?:api\/media\/[a-z0-9-]+|logos\/[a-z0-9._/-]+|images\/[a-z0-9._/-]+)$/i.test(value));
const contentSchema = z.object({ name: z.string().trim().min(3).max(150), acronym: z.string().trim().min(2).max(10), slug: z.string().regex(/^[a-z0-9-]+$/), shortDescription: z.string().trim().min(10).max(500), fullDescription: z.string().trim().min(10).max(10000), logo: asset.refine(Boolean), heroImage: asset.optional().default(""), resourceUrl: asset.optional().default(""), displayOrder: z.coerce.number().int().min(0).max(999) });
const patchSchema = z.union([schema, contentSchema]);
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { if (!(await requestIsAdmin(request, ["SUPERADMIN", "EDITOR"]))) return Response.json({ error: "No autorizado" }, { status: 401 }); const parsed = patchSchema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 }); const id = (await context.params).id; if ("status" in parsed.data) await setTrainingStatus(id, parsed.data.status); else await updateTraining(id, { ...parsed.data, heroImage: parsed.data.heroImage || null, resourceUrl: parsed.data.resourceUrl || null }); return Response.json({ ok: true }); }
