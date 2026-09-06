import { ArrowRight } from "lucide-react";
import { getTrainings } from "../../db/repository";
import { trainingBelongsTo, trainingCategories, type TrainingCategoryKey } from "../../lib/training-categories";
import { TrainingCard } from "./PublicUI";
import { SectionEyebrow } from "./SiteChrome";

export async function TrainingCatalogPage({ category }: { category: TrainingCategoryKey }) {
  const definition = trainingCategories.find((item) => item.key === category)!;
  const trainings = (await getTrainings()).filter((item) => trainingBelongsTo(item, category));
  return <>
    <section className="page-hero page-hero--catalog"><div className="shell"><SectionEyebrow>{definition.eyebrow}</SectionEyebrow><h1>{definition.label} para<br /><em>entrenar posibilidades.</em></h1><p>{definition.description}</p></div></section>
    <nav className="program-index program-index--groups" aria-label="Categorías de entrenamientos"><div className="shell">{trainingCategories.map((item, index) => <a className={item.key === category ? "active" : ""} href={`/entrenamientos/${item.key}`} key={item.key}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</a>)}</div></nav>
    <section className="training-collection training-collection--category"><div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>{definition.eyebrow}</SectionEyebrow><h2>{definition.label} de Gimnasio del Cerebro</h2></div><p>{definition.description}</p></div>{trainings.length ? <div className="training-grid">{trainings.map((training, index) => <TrainingCard training={training} index={index} key={training.id} />)}</div> : <div className="empty-state"><h2>Próximamente</h2><p>Estamos preparando nuevas propuestas para esta categoría.</p></div>}<div className="section-more"><a className="button button--outline" href="/entrenamientos">Ver todas las categorías <ArrowRight size={18} /></a></div></div></section>
  </>;
}
