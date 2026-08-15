import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { getTraining, getTrainings } from "../../../../db/repository";
import { whatsappUrl } from "../../../../lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function TrainingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [training, all] = await Promise.all([getTraining(slug), getTrainings()]);
  if (!training) notFound();
  const related = all.filter((item) => item.slug !== slug).slice(0, 3);
  return <>
    <section className="training-detail-hero"><div className="shell training-detail-hero__grid"><div><a className="back-link" href="/entrenamientos"><ArrowLeft size={16} />Todos los entrenamientos</a><span className="program-feature__acronym">{training.acronym}</span><h1>{training.name}</h1><p>{training.shortDescription}</p><a className="button button--light" href={whatsappUrl(`Hola, quisiera recibir más información sobre ${training.name}.`)} target="_blank" rel="noreferrer"><MessageCircle size={18} />Consultar por WhatsApp</a></div><div className="training-detail-hero__logo"><img src={training.logo} alt={`Logo oficial de ${training.name}`} width={720} height={720} /></div></div></section>
    <section className="detail-body"><div className="shell detail-body__grid"><div><span className="detail-index">El entrenamiento</span><h2>Un espacio para comprender y llevar el aprendizaje a la práctica.</h2></div><div><p>{training.fullDescription}</p><ul className="clean-list"><li><CheckCircle2 />Contenido organizado a partir de la propuesta actual.</li><li><CheckCircle2 />Orientación por WhatsApp antes de elegir.</li><li><CheckCircle2 />Información clara, sin afirmaciones clínicas añadidas.</li></ul></div></div></section>
    <section className="related-section"><div className="shell"><div className="section-heading section-heading--split"><h2>Otros entrenamientos</h2><a className="text-link" href="/entrenamientos">Ver todos <ArrowRight size={16} /></a></div><div className="related-grid">{related.map((item) => <a href={`/entrenamientos/${item.slug}`} key={item.id}><img src={item.logo} alt={`Logo oficial de ${item.name}`} width={220} height={220} loading="lazy" /><span><strong>{item.acronym}</strong>{item.name}</span><ArrowRight /></a>)}</div></div></section>
  </>;
}
