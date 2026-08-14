import { requestIsAdmin } from "../../../../lib/auth";
import { getContacts } from "../../../../db/repository";
export async function GET(request: Request) { if (!(await requestIsAdmin(request))) return Response.json({ error: "No autorizado" }, { status: 401 }); const url = new URL(request.url); return Response.json({ contacts: await getContacts(url.searchParams.get("q") ?? "", url.searchParams.get("status") ?? "") }); }
