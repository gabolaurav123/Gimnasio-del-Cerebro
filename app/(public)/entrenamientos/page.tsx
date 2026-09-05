import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { getSettings, getTrainings, type Training } from "../../../db/repository";
import { SectionEyebrow } from "../../components/SiteChrome";
import { TrainingCard } from "../../components/PublicUI";
import { whatsappUrl } from "../../../lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrenamientos y cursos | Gimnasio del Cerebro", description: "Programas, cursos, neuroretos y talleres de Gimnasio del Cerebro." };

const principalAcronyms = new Set(["NFA", "NTR", "BFT", "NTM", "ALP", "NCO"]);

function CatalogSection({ id, eyebrow, title, description, items, offset }: { id: string; eyebrow: string; title: string; description: string; items: Training[]; offset: number }) {
  if (!items.length) return null;
  return <section className="training-collection" id={id}><div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>{eyebrow}</SectionEyebrow><h2>{title}</h2></div><p>{description}</p></div><div className="training-grid">{items.map((training, index) => <TrainingCard training={training} index={offset + index} key={training.id} />)}</div></div></section>;
}

export default async function TrainingsPage() {
  const [trainings, settings] = await Promise.all([getTrainings(), getSettings()]);
  const principals = trainings.filter((training) => principalAcronyms.has(training.acronym));
  const courses = trainings.filter((training) => training.acronym === "CURSO");
  const challenges = trainings.filter((training) => training.acronym === "RETO");
  const workshops = trainings.filter((training) => training.acronym === "TALLER");
  return <>
    <section className="page-hero page-hero--trainings"><div className="shell"><SectionEyebrow>Entrenamientos</SectionEyebrow><h1>Comprender la mente.<br /><em>Entrenar nuevas posibilidades.</em></h1><p>Explora programas principales, cursos, neuroretos y talleres organizados para que encuentres con claridad el formato que necesitas.</p></div></section>
    <nav className="program-index program-index--groups" aria-label="Categorías de entrenamientos"><div className="shell"><a href="#programas"><span>01</span>Programas</a><a href="#cursos"><span>02</span>Cursos</a><a href="#neuroretos"><span>03</span>Neuroretos</a><a href="#talleres"><span>04</span>Talleres</a></div></nav>
    <section className="program-list" id="programas"><div className="shell"><div className="section-heading section-heading--split program-list__heading"><div><SectionEyebrow>Métodos principales</SectionEyebrow><h2>Programas de Gimnasio del Cerebro</h2></div><p>Las rutas centrales de formación y entrenamiento que sostienen nuestro enfoque educativo.</p></div>{principals.map((training, index) => <article className="program-feature" id={training.slug} key={training.id}><div className="program-feature__logo"><span>{String(index + 1).padStart(2, "0")}</span><img src={training.logo} alt={`Logo oficial de ${training.name}`} width={700} height={700} loading="lazy" /></div><div className="program-feature__copy"><span className="program-feature__acronym">{training.acronym}</span><h2>{training.name}</h2><p>{training.shortDescription}</p><div className="button-row"><a className="button button--primary" href={`/entrenamientos/${training.slug}`}>Conocer el entrenamiento <ArrowRight size={18} /></a><a className="button button--outline" href={training.checkoutUrl ? `/checkout/entrenamiento/${training.slug}` : whatsappUrl(`Hola, quiero adquirir el entrenamiento ${training.name}. ¿Podrían indicarme disponibilidad y forma de pago?`, settings.whatsapp)} target={training.checkoutUrl ? undefined : "_blank"} rel={training.checkoutUrl ? undefined : "noreferrer"}><ShoppingBag size={18} />Adquirir</a></div></div></article>)}</div></section>
    <CatalogSection id="cursos" eyebrow="Formación concentrada" title="Cursos y experiencias Express" description="Formatos claros y enfocados para comenzar o profundizar un tema específico." items={courses} offset={principals.length} />
    <CatalogSection id="neuroretos" eyebrow="Práctica cotidiana" title="Neuroretos de 21 días" description="Recorridos progresivos para convertir la comprensión en hábitos y observación diaria." items={challenges} offset={principals.length + courses.length} />
    <CatalogSection id="talleres" eyebrow="Experiencias temáticas" title="Talleres" description="Espacios de aprendizaje y práctica agrupados por tema, con una identidad visual común." items={workshops} offset={principals.length + courses.length + challenges.length} />
  </>;
}
