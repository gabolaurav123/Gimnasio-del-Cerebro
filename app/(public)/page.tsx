import Image from "next/image";
import { ArrowRight, Atom, BrainCircuit, Compass, Globe2, MessageCircle, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import { getPosts, getSettings, getTestimonials, getTrainings } from "../../db/repository";
import { BlogCard, TrainingCard } from "../components/PublicUI";
import { SectionEyebrow } from "../components/SiteChrome";
import { TestimonialStories } from "../components/TestimonialStories";
import { whatsappUrl } from "../../lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gimnasio del Cerebro | Entrena tu cerebro. Transforma tu vida.", description: "Entrenamientos de desarrollo personal, mente y aprendizaje consciente desde 2014." };

export default async function Home() {
  const [trainings, posts, settings, testimonials] = await Promise.all([getTrainings(), getPosts(), getSettings(), getTestimonials()]);
  const heroParts = settings.heroTitle.split(".").filter(Boolean);
  return (
    <>
      <section className="hero">
        <picture className="hero__image"><source media="(max-width: 700px)" srcSet="/images/hero-neuroscience-quantum-mobile-v1.png" /><Image src="/images/hero-neuroscience-quantum-desktop-v1.png" alt="Cerebro humano luminoso conectado por una red científica que representa neurociencia, aprendizaje y posibilidades" fill priority sizes="100vw" /></picture>
        <div className="hero__wash" />
        <div className="shell hero__content">
          <div className="hero__copy">
            <div className="eyebrow eyebrow--light"><Sparkles size={16} />{settings.heroEyebrow}</div>
            <h1>{heroParts[0]}.<br /><em>{heroParts.slice(1).join(".")}.</em></h1>
            <p>{settings.heroDescription}</p>
            <div className="button-row"><a className="button button--light" href="/entrenamientos">Explorar entrenamientos <ArrowRight size={18} /></a><a className="button button--ghost-light" href={whatsappUrl("Hola, quisiera recibir información sobre los entrenamientos de Gimnasio del Cerebro.", settings.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={18} />Hablar por WhatsApp</a></div>
            <div className="hero__trust"><span>Neurociencia aplicada</span><span>Aprendizaje consciente</span><span>Perspectiva cuántica conceptual</span></div>
          </div>
        </div>
        <a className="hero__scroll" href="#experiencia"><span />Descubrir</a>
      </section>

      <section className="experience" id="experiencia">
        <div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>Una trayectoria que sigue creciendo</SectionEyebrow><h2>Desde 2014 entrenando cerebros alrededor del mundo.</h2></div><p>Una comunidad construida alrededor del aprendizaje, la consciencia y herramientas para comprendernos mejor.</p></div>
          <div className="stats-grid"><div><Compass /><strong>2014</strong><span>Año de inicio</span></div><div><Sparkles /><strong>+10</strong><span>Años de experiencia</span></div><div><Globe2 /><strong>+15</strong><span>Países alcanzados</span></div><div><Users /><strong>Miles</strong><span>De estudiantes</span></div></div>
        </div>
      </section>

      <section className="science-band"><div className="shell"><div className="science-band__intro"><SectionEyebrow>Cómo trabajamos</SectionEyebrow><h2>Neurociencia para aprender. Práctica para transformar.</h2><p>Integramos herramientas de neurociencia y aprendizaje con una perspectiva conceptual inspirada en la física cuántica, siempre como propuesta educativa y no como sustituto de atención médica o psicológica.</p><a className="text-link" href="/nosotros">Conocer nuestro enfoque <ArrowRight size={16} /></a></div><div className="science-band__cards"><article><BrainCircuit /><strong>Neurociencia aplicada</strong><span>Comprender atención, hábitos y aprendizaje.</span></article><article><Atom /><strong>Perspectiva cuántica</strong><span>Una mirada conceptual sobre posibilidades e interconexión.</span></article></div></div></section>

      <section className="trainings-section" id="entrenamientos">
        <div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>Rutas de transformación</SectionEyebrow><h2>Nuestros entrenamientos</h2></div><div><p>Seis programas con enfoques distintos, conectados por una misma intención: comprender, entrenar y ampliar posibilidades.</p></div></div><div className="training-grid">{trainings.slice(0, 3).map((training, index) => <TrainingCard training={training} index={index} key={training.id} />)}</div><div className="section-more"><a className="button button--primary" href="/entrenamientos">Ver más entrenamientos <ArrowRight size={18} /></a></div></div>
      </section>

      <TestimonialStories testimonials={testimonials} />

      <section className="manifesto"><div className="shell manifesto__grid"><div className="manifesto__visual"><div className="manifesto__brain"><img src="/images/brain-orbit-transparent-v2.png" alt="Cerebro transparente rodeado por anillos de conexión" width={720} height={720} /></div></div><div className="manifesto__copy"><SectionEyebrow>Conocer para transformar</SectionEyebrow><h2>No se trata de saber más. Se trata de <em>comprender mejor.</em></h2><p>Gimnasio del Cerebro propone espacios de entrenamiento donde el conocimiento se vuelve experiencia, observación y nuevas formas de actuar.</p><div className="manifesto__points"><div><span>01</span><p><strong>Consciencia</strong>Observar cómo pensamos, sentimos y respondemos.</p></div><div><span>02</span><p><strong>Entrenamiento</strong>Llevar lo aprendido a la práctica cotidiana.</p></div><div><span>03</span><p><strong>Transformación</strong>Ampliar posibilidades desde una comprensión más profunda.</p></div></div><a className="button button--primary" href="/contacto">Conocer Gimnasio del Cerebro <ArrowRight size={18} /></a></div></div></section>

      <section className="journal-section"><div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>Ideas para seguir creciendo</SectionEyebrow><h2>Sigue entrenando tu mente</h2></div><div><p>Artículos, herramientas y contenido para seguir expandiendo tu consciencia.</p><a className="text-link" href="/blog">Ver todos los artículos <ArrowRight size={16} /></a></div></div><div className="blog-grid">{posts.slice(0, 3).map((post, index) => <BlogCard post={post} index={index} key={post.id} />)}</div></div></section>

      <section className="final-cta"><div className="shell final-cta__inner"><div><span className="final-cta__kicker">Tu próximo paso</span><h2>{settings.ctaTitle}</h2><p>{settings.ctaDescription}</p></div><div className="button-row"><a className="button button--light" href="/entrenamientos">Explorar entrenamientos <ArrowRight size={18} /></a><a className="button button--ghost-light" href={whatsappUrl("Hola, quisiera orientación para elegir un entrenamiento de Gimnasio del Cerebro.", settings.whatsapp)} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></div></div></section>
    </>
  );
}
