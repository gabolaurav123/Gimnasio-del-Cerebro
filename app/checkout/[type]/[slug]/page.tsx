import { ArrowLeft, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getProduct, getTraining } from "../../../../db/repository";
import { getCustomerSession } from "../../../../lib/customer-auth";
import { CheckoutButton } from "../../../components/CheckoutButton";

export const dynamic = "force-dynamic";
export default async function CheckoutPage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  if (!(["producto", "entrenamiento"].includes(type))) notFound();
  const item = type === "producto" ? await getProduct(slug) : await getTraining(slug);
  if (!item || item.status !== "PUBLISHED") notFound();
  const session = await getCustomerSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(`/checkout/${type}/${slug}`)}`);
  const provider = item.checkoutProvider;
  return <main className="checkout-page"><a className="checkout-brand" href="/"><img src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" /><span>Pago seguro</span></a><section><div className="checkout-context"><a className="back-link" href={type === "producto" ? "/productos" : `/entrenamientos/${slug}`}><ArrowLeft size={16} />Volver</a><div className="checkout-account"><Mail size={17} /><span>Compra vinculada a<strong>{session.email}</strong></span></div></div><h1>{item.name}</h1><p>{"description" in item ? item.description : item.shortDescription}</p><div className="checkout-summary"><div><span>Importe</span><strong>{item.priceCents > 0 ? new Intl.NumberFormat("es-BO", { style: "currency", currency: item.currency }).format(item.priceCents / 100) : provider === "MANUAL" ? "Por confirmar" : `Lo muestra ${provider === "HOTMART" ? "Hotmart" : "Stripe"}`}</strong></div><div><span>Método</span><strong>{provider === "MANUAL" ? "Coordinación con el equipo" : provider}</strong></div></div><div className="checkout-security"><LockKeyhole /><p>Gimnasio del Cerebro no almacena datos de tarjeta. El cobro se completa en el sitio seguro del proveedor configurado.</p></div>{provider !== "MANUAL" && item.checkoutUrl ? <CheckoutButton itemType={type === "producto" ? "PRODUCT" : "TRAINING"} itemId={item.id} provider={provider} /> : <a className="button button--primary" href="/contacto"><ShieldCheck size={18} />Solicitar forma de pago</a>}</section></main>;
}
