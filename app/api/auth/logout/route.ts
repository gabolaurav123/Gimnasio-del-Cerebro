import { clearSessionCookie } from "../../../../lib/auth";
export async function POST() { return new Response(null, { status: 204, headers: { "set-cookie": clearSessionCookie() } }); }
