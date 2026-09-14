import { ArrowLeft, ArrowRight, BrainCircuit, Check, Crown, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getSettings } from "../../../../db/repository";
import { KIRIUS_CAP_SLUG } from "../../../../lib/product-routes";
import { whatsappUrl } from "../../../../lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gorro Gimnasio del Cerebro by Kirius",
  description: "Conoce la edición negra y dorada del gorro de la comunidad Gimnasio del Cerebro antes de adquirirla.",
};

export default async function CapProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== KIRIUS_CAP_SLUG) notFound();
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product || product.status !== "PUBLISHED") notFound();

  const checkoutAvailable = product.checkoutProvider !== "MANUAL" && Boolean(product.checkoutUrl);
  const price = product.priceCents > 0
    ? new Intl.NumberFormat("es-BO", { style: "currency", currency: product.currency }).format(product.priceCents / 100)
    : product.priceLabel;
  const questionUrl = whatsappUrl(`Hola, quisiera conocer la disponibilidad y entrega de ${product.name}.`, settings.whatsapp);

  return <main className="cap-product-page">
    <section className="cap-product-hero">
      <div className="shell cap-product-hero__grid">
        <div className="cap-product-copy">
          <a className="cap-product-back" href="/productos"><ArrowLeft size={17} />Volver a productos</a>
          <span className="cap-product-eyebrow"><Sparkles size={15} />Edición especial · Gimnasio del Cerebro × Kirius</span>
          <h1>Una identidad que<br /><em>se lleva.</em></h1>
          <p>{product.description}</p>
          <div className="cap-product-actions">
            {checkoutAvailable ? <a className="button cap-product-buy" href={`/checkout/producto/${product.slug}`}><Crown size={18} />Ver disponibilidad y comprar <ArrowRight size={17} /></a> : <a className="button cap-product-buy" href={questionUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />Consultar disponibilidad</a>}
            <a className="cap-product-question" href={questionUrl} target="_blank" rel="noreferrer">Consultar entrega por WhatsApp</a>
          </div>
          <dl className="cap-product-facts">
            <div><dt>Identidad</dt><dd>Negro y dorado</dd></div>
            <div><dt>Símbolo</dt><dd>Mente y aprendizaje</dd></div>
            <div><dt>Compra</dt><dd>{checkoutAvailable ? product.checkoutProvider : "Con el equipo"}</dd></div>
          </dl>
        </div>
        <figure className="cap-product-visual">
          <span className="cap-product-visual__edition">01 · Edición comunidad</span>
          <img src={product.image || "/images/catalog/product-cap-v1.png"} alt={product.name} width={1536} height={1024} />
          <figcaption><img src="/logos/gdc-full-v2.jpg" alt="" width={38} height={38} /><span>Gimnasio del Cerebro<strong>by Kirius</strong></span></figcaption>
        </figure>
      </div>
    </section>

    <section className="cap-product-story">
      <div className="shell">
        <div className="cap-product-section-heading"><span>Más que un accesorio</span><h2>Un símbolo cotidiano de consciencia, aprendizaje y comunidad.</h2></div>
        <div className="cap-product-values">
          <article><BrainCircuit /><span>01</span><h3>La mente al centro</h3><p>El cerebro representa la decisión de seguir aprendiendo y observar nuevas posibilidades.</p></article>
          <article><Crown /><span>02</span><h3>Negro y dorado</h3><p>Una combinación sobria y distintiva para expresar la identidad de la comunidad.</p></article>
          <article><ShieldCheck /><span>03</span><h3>Compra acompañada</h3><p>Antes de pagar puedes revisar la disponibilidad y consultar la coordinación de entrega.</p></article>
        </div>
      </div>
    </section>

    <section className="cap-product-order">
      <div className="shell cap-product-order__grid">
        <div><span>Adquisición</span><h2>Conoce el producto primero.<br />Compra cuando estés listo.</h2><p>El precio final, la disponibilidad y las condiciones de entrega se muestran o confirman durante el proceso de adquisición.</p></div>
        <aside>
          <div className="cap-product-order__price"><small>Información comercial</small><strong>{price}</strong></div>
          <ul><li><Check />Acceso mediante tu cuenta personal</li><li><Check />Pago en el proveedor seguro configurado</li><li><Check />Coordinación posterior con el equipo</li></ul>
          {checkoutAvailable ? <a className="button cap-product-buy" href={`/checkout/producto/${product.slug}`}><LockKeyhole size={18} />Continuar a la compra <ArrowRight size={17} /></a> : <a className="button cap-product-buy" href={questionUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />Hablar con el equipo</a>}
        </aside>
      </div>
    </section>
  </main>;
}
