import { ArrowRight, BrainCircuit, CalendarRange, GraduationCap, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { trainingCategories } from "../../../lib/training-categories";
import { SectionEyebrow } from "../../components/SiteChrome";

export const metadata: Metadata = { title: "Entrenamientos | Gimnasio del Cerebro", description: "Elige entre programas, cursos, neuroretos y talleres de Gimnasio del Cerebro." };

const icons = { programas: BrainCircuit, cursos: GraduationCap, neuroretos: CalendarRange, talleres: Sparkles };

export default function TrainingsPage() {
  return <>
    <section className="page-hero page-hero--trainings"><div className="shell"><SectionEyebrow>Entrenamientos</SectionEyebrow><h1>Elige cómo quieres<br /><em>entrenar tu mente.</em></h1><p>Cada formato tiene su propio espacio. Selecciona una categoría para explorarla con claridad.</p></div></section>
    <section className="training-category-hub"><div className="shell"><div className="training-category-grid">{trainingCategories.map((item, index) => { const Icon = icons[item.key]; return <a href={`/entrenamientos/${item.key}`} className={`training-category-card training-category-card--${item.key}`} key={item.key}><span>{String(index + 1).padStart(2, "0")}</span><Icon /><div><h2>{item.label}</h2><p>{item.description}</p></div><strong>Explorar {item.label.toLowerCase()} <ArrowRight size={18} /></strong></a>; })}</div></div></section>
  </>;
}
