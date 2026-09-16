import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ state?: string; provider?: string }> }) {
  const query = await searchParams;
  const cancelled = query.state === "cancelled";
  const provider = query.provider?.toLowerCase() === "hotmart" ? "Hotmart" : "Stripe";
  return <main className="checkout-page"><section>
    <a className="back-link" href="/"><ArrowLeft size={17} />Volver al sitio</a>
    <div className="checkout-badge">{cancelled ? <Clock3 size={18} /> : <CheckCircle2 size={18} />}{cancelled ? "Pago no completado" : "Confirmación automática"}</div>
    <h1>{cancelled ? "Tu pago no se realizó." : "Estamos confirmando tu pago."}</h1>
    <p>{cancelled ? `No se registró un cobro en ${provider} desde este intento. Puedes volver al producto cuando quieras.` : `${provider} enviará una confirmación segura al sitio. En cuanto sea validada, el pago aparecerá en tu cuenta y el acceso correspondiente quedará habilitado automáticamente.`}</p>
    <div className="checkout-benefits"><p><ShieldCheck size={18} /><span><strong>La URL no concede acceso.</strong> La validación depende exclusivamente del evento firmado del proveedor.</span></p></div>
    <div className="button-row"><a className="button button--primary" href="/mi-cuenta">Revisar mi cuenta</a><a className="button button--outline" href="/productos">Volver al catálogo</a></div>
  </section></main>;
}
