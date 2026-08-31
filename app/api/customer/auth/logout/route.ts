import { clearCustomerSessionCookie } from "../../../../../lib/customer-auth";
import { requestIsSameOrigin } from "../../../../../lib/auth";

export async function POST(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  return new Response(null, { status: 204, headers: { "set-cookie": clearCustomerSessionCookie(), "cache-control": "no-store" } });
}
