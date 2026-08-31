import { ArrowRight, PackageOpen, ShoppingBag, Tag } from "lucide-react";
import type { Metadata } from "next";
import { getProducts, getSettings } from "../../../db/repository";
import { whatsappUrl } from "../../../lib/whatsapp";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Productos | Gimnasio del Cerebro", description: "Productos y recursos disponibles de Gimnasio del Cerebro." };

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return <><section className="page-hero"><div className="shell"><SectionEyebrow>Productos</SectionEyebrow><h1>Recursos para continuar<br /><em>entrenando tu mente.</em></h1><p>Conoce los productos disponibles y accede con tu cuenta a una compra vinculada de forma segura.</p></div></section><section className="public-catalog"><div className="shell">{products.length ? <div className="catalog-grid">{products.map((product) => <article className="catalog-card" key={product.id}><div className="catalog-card__visual">{product.image ? <img src={product.image} alt={product.name} width={720} height={480} /> : <PackageOpen />}{product.discountLabel && <span><Tag size={14} />{product.discountLabel}</span>}</div><div className="catalog-card__body"><small>{product.priceLabel}</small><h2>{product.name}</h2><p>{product.description}</p><a className="button button--primary" href={`/checkout/producto/${product.slug}`}><ShoppingBag size={17} />Adquirir producto</a></div></article>)}</div> : <div className="public-empty"><PackageOpen /><h2>Estamos preparando nuevos productos.</h2><p>Vuelve pronto o escríbenos para conocer los recursos disponibles.</p><a className="button button--primary" href={whatsappUrl("Hola, quisiera conocer los productos disponibles de Gimnasio del Cerebro.", settings.whatsapp)} target="_blank" rel="noreferrer">Consultar por WhatsApp <ArrowRight size={17} /></a></div>}</div></section></>;
}
