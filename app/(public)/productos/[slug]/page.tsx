import { ArrowLeft, ArrowRight, BrainCircuit, Check, Clock3, Crown, Droplets, Headphones, Layers, LockKeyhole, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getSettings } from "../../../../db/repository";
import { KIRIUS_CAP_SLUG } from "../../../../lib/product-routes";
import { whatsappUrl } from "../../../../lib/whatsapp";
import { hasOnlineCheckout } from "../../../../lib/checkout-availability";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "BioShield by KIRYUS™ | Gimnasio del Cerebro",
  description: "Conoce BioShield by KIRYUS™, su construcción por capas y el kit de la edición Founder antes de adquirirlo.",
};

export default async function CapProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== KIRIUS_CAP_SLUG) notFound();
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product || product.status !== "PUBLISHED") notFound();

  const checkoutAvailable = hasOnlineCheckout(product);
  const price = product.priceCents > 0
    ? new Intl.NumberFormat("es-BO", { style: "currency", currency: product.currency }).format(product.priceCents / 100)
    : "Precio mostrado por Stripe";
  const questionUrl = whatsappUrl("Hola, quisiera conocer la disponibilidad, precio y entrega de BioShield by KIRYUS.", settings.whatsapp);

  return <main className="cap-product-page">
    <section className="cap-product-hero">
      <div className="shell cap-product-hero__grid">
        <div className="cap-product-copy">
          <a className="cap-product-back" href="/productos"><ArrowLeft size={17} />Volver a productos</a>
          <img className="cap-product-kiryus-logo" src="/images/bioshield/kiryus-logo.png" alt="KIRYUS" width={330} height={140} />
          <span className="cap-product-eyebrow"><Sparkles size={15} />Edición Founder · KIRYUS × Gimnasio del Cerebro</span>
          <h1>BioShield<br /><em>by KIRYUS™.</em></h1>
          <p>Una experiencia premium creada para acompañar momentos de enfoque, pausa y presencia, con una estética técnica en negro y dorado.</p>
          <div className="cap-product-actions">
            {checkoutAvailable ? <a className="button cap-product-buy" href={`/checkout/producto/${product.slug}`}><Crown size={18} />Conocer disponibilidad y comprar <ArrowRight size={17} /></a> : <a className="button cap-product-buy" href={questionUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />Consultar disponibilidad</a>}
            <a className="cap-product-question" href={questionUrl} target="_blank" rel="noreferrer">Consultar entrega por WhatsApp</a>
          </div>
          <dl className="cap-product-facts">
            <div><dt>Experiencia</dt><dd>Enfoque y presencia</dd></div>
            <div><dt>Edición</dt><dd>Founder numerada</dd></div>
            <div><dt>Compra</dt><dd>{checkoutAvailable ? product.checkoutProvider : "Con el equipo"}</dd></div>
          </dl>
        </div>
        <figure className="cap-product-visual">
          <span className="cap-product-visual__edition">BioShield · Founder Edition</span>
          <img src="/images/bioshield/hero-wellness.png" alt="Persona usando BioShield by KIRYUS" width={1536} height={1024} />
          <figcaption><img src="/images/bioshield/kiryus-logo.png" alt="" width={58} height={38} /><span>BioShield<strong>by KIRYUS™</strong></span></figcaption>
        </figure>
      </div>
    </section>

    <section className="cap-product-story">
      <div className="shell">
        <div className="cap-product-section-heading"><span>Diseñado como experiencia</span><h2>Un recordatorio cotidiano para volver a lo esencial.</h2></div>
        <div className="cap-product-values">
          <article><BrainCircuit /><span>01</span><h3>Enfoque</h3><p>Una propuesta para acompañar momentos de atención intencional y claridad.</p></article>
          <article><Clock3 /><span>02</span><h3>Pausa</h3><p>Una señal personal para detener el ruido y recuperar espacio consciente.</p></article>
          <article><ShieldCheck /><span>03</span><h3>Presencia</h3><p>Un objeto de uso diario conectado con la identidad y la comunidad KIRYUS.</p></article>
        </div>
      </div>
    </section>

    <section className="cap-product-shift">
      <div className="shell">
        <div className="cap-product-section-heading cap-product-section-heading--dark"><span>Del ruido a la intención</span><h2>Una señal visible para cambiar el ritmo de tu día.</h2></div>
        <div className="cap-product-shift__grid">
          <article><small>Antes</small><h3>Sobrecarga y dispersión</h3><p>Demasiados estímulos, tareas abiertas y poco espacio para decidir con claridad.</p><ul><li><Check />Atención fragmentada</li><li><Check />Pausas que nunca llegan</li><li><Check />Rutinas sin intención</li></ul></article>
          <div className="cap-product-shift__line" aria-hidden="true"><ArrowRight /></div>
          <article className="cap-product-shift__result"><small>Tu ritual BioShield</small><h3>Enfoque, pausa y presencia</h3><p>Un objeto cotidiano que acompaña el momento en que eliges detenerte, respirar y volver a tu prioridad.</p><ul><li><Sparkles />Una señal personal</li><li><BrainCircuit />Un ritual de enfoque</li><li><Crown />Una experiencia Founder</li></ul></article>
        </div>
      </div>
    </section>

    <section className="cap-product-tech">
      <div className="shell cap-product-tech__grid">
        <figure><img src="/images/bioshield/bioshield-layers.png" alt="Construcción por capas de BioShield by KIRYUS" width={1400} height={1000} /></figure>
        <div><span>Construcción y materiales</span><h2>Diseño técnico, cuidado en cada capa.</h2><p>La propuesta combina algodón orgánico, textil técnico premium, una estructura construida por capas y un bolsillo interno integrado.</p><ul><li><Layers />Estructura interna por capas</li><li><ShieldCheck />Textil técnico premium</li><li><Check />Algodón orgánico</li><li><Crown />Acabado negro y dorado</li></ul></div>
      </div>
    </section>

    <section className="cap-product-kit">
      <div className="shell cap-product-tech__grid cap-product-tech__grid--reverse">
        <div><span>Kit Founder</span><h2>Una experiencia que continúa más allá del producto.</h2><p>La edición Founder reúne el producto físico con contenidos y accesos complementarios de KIRYUS.</p><ul><li><Crown />BioShield Founder numerado</li><li><Headphones />Audios Neurofocus</li><li><BrainCircuit />Guía digital de coherencia</li><li><MessageCircle />Código de acceso premium a Telegram</li><li><ShieldCheck />Certificado Founder</li></ul></div>
        <figure><img src="/images/bioshield/founder-kit.png" alt="Kit Founder de BioShield by KIRYUS" width={1400} height={1000} /></figure>
      </div>
    </section>

    <section className="cap-product-access">
      <div className="shell cap-product-access__grid">
        <div><span>Acceso Founder</span><h2>Tu experiencia digital, vinculada a la compra.</h2><p>Después de validarse el pago, el equipo confirma los siguientes pasos del kit. El código premium de Telegram es personal y se entrega junto con las indicaciones de acceso a los contenidos Founder.</p></div>
        <div className="cap-product-access__steps"><article><strong>01</strong><div><h3>Compra segura</h3><p>Continúa mediante el proveedor de pago configurado.</p></div></article><article><strong>02</strong><div><h3>Validación</h3><p>La compra queda registrada y asociada al correo utilizado.</p></div></article><article><strong>03</strong><div><h3>Acceso premium</h3><p>Recibes las indicaciones del kit, los audios y tu código personal.</p></div></article></div>
      </div>
    </section>

    <section className="cap-product-faq">
      <div className="shell cap-product-faq__grid">
        <div><span>Preguntas frecuentes</span><h2>Lo esencial antes de adquirir BioShield.</h2><p>La disponibilidad, el precio final y los datos de entrega se muestran o confirman durante el proceso de compra.</p></div>
        <div className="cap-product-faq__items">
          <details><summary>¿Qué incluye la edición Founder?</summary><p>BioShield Founder numerado, audios Neurofocus, guía digital, código premium de Telegram y certificado Founder.</p></details>
          <details><summary>¿Cuándo se entrega?</summary><p>La estimación comunicada para la preventa es de 25 a 40 días después de su cierre. El equipo confirma el seguimiento y cualquier actualización.</p></details>
          <details><summary>¿Cómo debo cuidarlo?</summary><p>Lávalo a mano con agua fría y jabón neutro. Evita blanqueadores, retorcerlo o exponerlo a calor directo; sécalo a la sombra.</p></details>
          <details><summary>¿Sustituye atención o tratamiento profesional?</summary><p>No. BioShield es un producto de bienestar y una experiencia de marca; no diagnostica, trata ni previene enfermedades.</p></details>
        </div>
      </div>
    </section>

    <section className="cap-product-order">
      <div className="shell cap-product-order__grid">
        <div><span>Adquisición y cuidados</span><h2>Revisa la información.<br />Compra cuando estés listo.</h2><p>La entrega estimada es de 25 a 40 días después del cierre de la preventa. Se recomienda lavar a mano con agua fría y jabón neutro, y secar a la sombra. La garantía de fabricación es de 30 días.</p><div className="cap-product-care"><span><Clock3 />Entrega coordinada</span><span><Droplets />Cuidado manual</span><span><ShieldCheck />Garantía de fabricación</span></div></div>
        <aside>
          <div className="cap-product-order__price"><small>Información comercial</small><strong>{price}</strong></div>
          <ul><li><Check />Acceso mediante tu cuenta personal</li><li><Check />Pago en el proveedor seguro configurado</li><li><Check />Confirmación al validarse el pago</li></ul>
          {checkoutAvailable ? <a className="button cap-product-buy" href={`/checkout/producto/${product.slug}`}><LockKeyhole size={18} />Continuar a la compra <ArrowRight size={17} /></a> : <a className="button cap-product-buy" href={questionUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} />Hablar con el equipo</a>}
        </aside>
      </div>
    </section>
  </main>;
}
