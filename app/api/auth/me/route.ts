import { requestIsAdmin } from "../../../../lib/auth";
export async function GET(request: Request) { const authenticated = await requestIsAdmin(request); return Response.json({ authenticated }, { status: authenticated ? 200 : 401 }); }
