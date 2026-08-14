import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { getTrainings } from "../../../db/repository";
import { SectionEyebrow } from "../../components/SiteChrome";
import { whatsappUrl } from "../../../lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrenamientos | Gimnasio del Cerebro", description: "Conoce los seis entrenamientos actuales de Gimnasio del Cerebro." };

export default async function TrainingsPage() {
  const trainings = await getTrainings();
  return <>
    <section className="page-hero page-hero--trainings"><div className="shell"><SectionEyebrow>Entrenamientos</SectionEyebrow><h1>Comprender la mente.<br /><em>Entrenar nuevas posibilidades.</em></h1><p>Cada entrenamiento propone una forma distinta de observar, aprender y avanzar en tu proceso de desarrollo personal.</p></div></section>
    <nav className="program-index" aria-label="Índice de entrenamientos"><div className="shell">{trainings.map((training) => <a href={`#${training.slug}`} key={training.id}><span>{training.acronym}</span>{training.name}</a>)}</div></nav>
    <section className="program-list"><div className="shell">{trainings.map((training, index) => <article className="program-feature" id={training.slug} key={training.id}><div className="program-feature__logo"><span>{String(index + 1).padStart(2, "0")}</span><Image src={training.logo} alt={`Logo oficial de ${training.name}`} width={700} height={700} /></div><div className="program-feature__copy"><span className="program-feature__acronym">{training.acronym}</span><h2>{training.name}</h2><p>{training.shortDescription}</p><div className="button-row"><Link className="button button--primary" href={`/entrenamientos/${training.slug}`}>Conocer el entrenamiento <ArrowRight size={18} /></Link><a className="button button--outline" href={whatsappUrl(`Hola, quisiera recibir más información sobre ${training.name}.`)} target="_blank" rel="noreferrer"><MessageCircle size={18} />Consultar</a></div></div></article>)}</div></section>
  </>;
}
