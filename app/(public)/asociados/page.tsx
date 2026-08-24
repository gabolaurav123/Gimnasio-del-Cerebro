import { ArrowUpRight, Globe2, Network } from "lucide-react";
import type { Metadata } from "next";
import { getAssociates } from "../../../db/repository";
import { SectionEyebrow } from "../../components/SiteChrome";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Asociados | Gimnasio del Cerebro", description: "Organizaciones y comunidades asociadas a Gimnasio del Cerebro." };

export default async function AssociatesPage() {
  const associates = await getAssociates();
  return <><section className="page-hero"><div className="shell"><SectionEyebrow>Red asociada</SectionEyebrow><h1>Proyectos que amplían<br /><em>nuestras posibilidades.</em></h1><p>Conoce las organizaciones, comunidades y páginas que colaboran o comparten iniciativas con Gimnasio del Cerebro.</p></div></section><section className="public-catalog"><div className="shell"><div className="associate-grid">{associates.map((associate) => <article className="associate-card" key={associate.id}><div className="associate-card__mark">{associate.image ? <img src={associate.image} alt="" width={220} height={160} /> : <Network />}</div><div><span><Globe2 size={15} />Proyecto asociado</span><h2>{associate.name}</h2><p>{associate.description}</p><a className="button button--outline" href={associate.url} target="_blank" rel="noreferrer">Visitar sitio oficial <ArrowUpRight size={17} /></a></div></article>)}</div></div></section></>;
}
