import { ArrowRight, PackageOpen, ShoppingBag, Tag } from "lucide-react";
import type { Metadata } from "next";
import { getProducts, getSettings } from "../../../db/repository";
import { whatsappUrl } from "../../../lib/whatsapp";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Productos | Gimnasio del Cerebro", description: "Productos y recursos disponibles de Gimnasio del Cerebro." };

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return <><section className="page-hero"><div className="shell"><SectionEyebrow>Productos</SectionEyebrow><h1>Recursos para continuar<br /><em>entrenando tu mente.</em></h1><p>Productos de Gimnasio del Cerebro presentados bajo una misma identidad y con acceso seguro a los proveedores de pago configurados.</p></div></section><section className="public-catalog"><div className="shell">{products.length ? <div className="catalog-grid">{products.map((product) => {
    const paymentAvailable = product.checkoutProvider !== "MANUAL" && Boolean(product.checkoutUrl);
    return <article className="catalog-card" key={product.id}><div className={`catalog-card__visual ${product.image ? "catalog-card__visual--image" : ""}`}>{product.image ? <img src={product.image} alt={product.name} width={720} height={480} /> : <PackageOpen />}<span className="catalog-card__brand"><img src="/logos/gdc-full-v2.jpg" alt="" width={34} height={34} />Gimnasio del Cerebro</span>{product.discountLabel && <span className="catalog-card__discount"><Tag size={14} />{product.discountLabel}</span>}</div><div className="catalog-card__body"><small>{product.priceLabel}</small><h2>{product.name}</h2><p>{product.description}</p>{paymentAvailable ? <a className="button button--primary" href={`/checkout/producto/${product.slug}`}><ShoppingBag size={17} />Comprar de forma segura</a> : <a className="button button--outline" href={whatsappUrl(`Hola, quisiera recibir información sobre ${product.name}.`, settings.whatsapp)} target="_blank" rel="noreferrer">Solicitar información <ArrowRight size={17} /></a>}</div></article>;
  })}</div> : <div className="public-empty"><PackageOpen /><h2>Estamos preparando nuevos productos.</h2><p>Vuelve pronto o escríbenos para conocer los recursos disponibles.</p><a className="button button--primary" href={whatsappUrl("Hola, quisiera conocer los productos disponibles de Gimnasio del Cerebro.", settings.whatsapp)} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowRight size={17} /></a></div>}</div></section></>;
}
