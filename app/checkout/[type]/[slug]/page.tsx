import { ArrowLeft, LockKeyhole, LogIn, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { getProduct, getTraining } from "../../../../db/repository";
import { getAdminSession } from "../../../../lib/auth";
import { getCustomerSession } from "../../../../lib/customer-auth";
import { CheckoutButton } from "../../../components/CheckoutButton";

export const dynamic = "force-dynamic";
export default async function CheckoutPage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  if (!(["producto", "entrenamiento"].includes(type))) notFound();
  const item = type === "producto" ? await getProduct(slug) : await getTraining(slug);
  if (!item || item.status !== "PUBLISHED") notFound();
  const [session, admin] = await Promise.all([getCustomerSession(), getAdminSession()]);
  const checkoutPath = `/checkout/${type}/${slug}`;
  const provider = item.checkoutProvider;
  const description = "description" in item ? item.description : item.shortDescription;
  if (!session && !admin) return <main className="checkout-page"><a className="checkout-brand" href="/"><img src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" /><span>Adquisición segura</span></a><section className="checkout-access-gate"><a className="back-link" href={type === "producto" ? "/productos" : `/entrenamientos/${slug}`}><ArrowLeft size={16} />Volver a {item.name}</a><span className="checkout-access-gate__icon"><LockKeyhole /></span><small>Tu selección está guardada</small><h1>Accede para adquirir<br />{item.name}</h1><p>Para adquirir este entrenamiento necesitas iniciar sesión o crear una cuenta. Después volverás automáticamente a este mismo paso.</p><div className="checkout-access-actions"><a className="button button--primary" href={`/login?next=${encodeURIComponent(checkoutPath)}`}><LogIn size={18} />Iniciar sesión</a><a className="button button--outline" href={`/login?mode=register&next=${encodeURIComponent(checkoutPath)}`}><UserPlus size={18} />Crear cuenta</a></div><div className="checkout-selection"><strong>{item.name}</strong><span>{description}</span></div></section></main>;
  const accountEmail = session?.email || admin?.email || "";
  return <main className="checkout-page"><a className="checkout-brand" href="/"><img src="/logos/gdc-full-v2.jpg" alt="Gimnasio del Cerebro" /><span>Pago seguro</span></a><section><div className="checkout-context"><a className="back-link" href={type === "producto" ? "/productos" : `/entrenamientos/${slug}`}><ArrowLeft size={16} />Volver</a><div className="checkout-account"><Mail size={17} /><span>{admin && !session ? "Vista comercial como administrador" : "Compra vinculada a"}<strong>{accountEmail}</strong></span></div></div><h1>{item.name}</h1><p>{description}</p><div className="checkout-summary"><div><span>Importe</span><strong>{item.priceCents > 0 ? new Intl.NumberFormat("es-BO", { style: "currency", currency: item.currency }).format(item.priceCents / 100) : provider === "MANUAL" ? "Por confirmar" : `Lo muestra ${provider === "HOTMART" ? "Hotmart" : "Stripe"}`}</strong></div><div><span>Método</span><strong>{provider === "MANUAL" ? "Coordinación con el equipo" : provider}</strong></div></div><div className="checkout-security"><LockKeyhole /><p>Gimnasio del Cerebro no almacena datos de tarjeta. El cobro se completa en el sitio seguro del proveedor configurado.</p></div>{provider !== "MANUAL" && item.checkoutUrl ? <CheckoutButton itemType={type === "producto" ? "PRODUCT" : "TRAINING"} itemId={item.id} provider={provider} /> : <a className="button button--primary" href="/contacto"><ShieldCheck size={18} />Solicitar forma de pago</a>}</section></main>;
}
