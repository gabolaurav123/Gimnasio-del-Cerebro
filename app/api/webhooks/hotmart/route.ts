import { processHotmartWebhook } from "../../../../lib/payment-automation";

export async function POST(request: Request) {
  const rawBody = await request.text();
  let bodyToken: string | null = null;
  try {
    const body = JSON.parse(rawBody) as { hottok?: unknown };
    bodyToken = typeof body.hottok === "string" ? body.hottok : null;
  } catch {
    return Response.json({ error: "Evento de Hotmart inválido." }, { status: 400 });
  }
  try {
    const token = request.headers.get("x-hotmart-hottok") || request.headers.get("hottok") || bodyToken;
    const result = await processHotmartWebhook(rawBody, token);
    return Response.json({ received: true, result }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar el evento de Hotmart.";
    return Response.json({ error: message }, { status: message.includes("Token") ? 401 : 500, headers: { "cache-control": "no-store" } });
  }
}
