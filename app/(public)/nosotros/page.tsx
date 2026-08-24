import Image from "next/image";
import { Atom, Award, BookOpen, BrainCircuit, Compass, Globe2, GraduationCap, HeartPulse, Lightbulb, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import { SectionEyebrow } from "../../components/SiteChrome";

export const metadata: Metadata = { title: "Nosotros | Gimnasio del Cerebro", description: "Conoce el enfoque educativo de Gimnasio del Cerebro y la trayectoria de su fundadora, Marisa Antonieta Cardozo Arce." };

export default function AboutPage() {
  return <>
    <section className="page-hero page-hero--about"><div className="shell"><SectionEyebrow>Gimnasio del Cerebro</SectionEyebrow><h1>Comprender la mente.<br /><em>Convertir conocimiento en experiencia.</em></h1><p>Desde 2014 creamos espacios de entrenamiento para observar patrones, desarrollar capacidades y actuar con mayor consciencia.</p></div></section>

    <section className="founder-section"><div className="shell founder-grid">
      <div className="founder-portrait"><Image src="/images/marisa-cardoso-portrait-v1.png" alt="Retrato profesional de Marisa Antonieta Cardozo Arce" width={1024} height={1536} priority /><div><Sparkles /><span>Creadora de</span><strong>Neurofitness Active</strong></div></div>
      <div className="founder-copy"><SectionEyebrow>Fundadora y directora</SectionEyebrow><h2>Marisa Antonieta<br /><em>Cardozo Arce</em></h2><p className="founder-lead">Médica de formación, magíster en medicina deportiva y traumatología, e investigadora en desarrollo personal desde 2006.</p><p>Su trayectoria reúne salud, liderazgo, formación de comunidades y creación de métodos de entrenamiento. Es CEO y fundadora de Gimnasio del Cerebro y creadora del método Neurofitness Active.</p>
        <div className="founder-facts"><div><BrainCircuit /><strong>Desde 2006</strong><span>Investigación en desarrollo personal</span></div><div><Globe2 /><strong>6 países</strong><span>Cursos, talleres y conferencias</span></div><div><Lightbulb /><strong>Métodos propios</strong><span>Neurofitness Active, PUO y DYNAMIKAS</span></div></div>
      </div>
    </div></section>

    <section className="founder-credentials"><div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>Trayectoria profesional</SectionEyebrow><h2>Formación, liderazgo y creación.</h2></div><p>Una trayectoria multidisciplinaria desarrollada entre salud, formación de líderes, proyectos educativos y trabajo internacional.</p></div>
      <div className="credentials-grid">
        <article><GraduationCap /><span>01</span><h3>Formación y salud</h3><p>Estudió Medicina en la Universidad Nacional de Tucumán y cursó la maestría en medicina deportiva y traumatología en la Universidad de Valencia (ADEIT).</p></article>
        <article><Award /><span>02</span><h3>Liderazgo</h3><p>Coach, manager y estratega en formación de líderes. Recibió el Doctor Honoris Causa de la Universidad Internacional de Desarrollo Humano y Liderazgo de México.</p></article>
        <article><Globe2 /><span>03</span><h3>Experiencia internacional</h3><p>Ha dictado cursos, talleres y conferencias en España, Argentina, Colombia, Estados Unidos, Chile y México.</p></article>
        <article><HeartPulse /><span>04</span><h3>Proyectos y organizaciones</h3><p>Presidenta de la A.E.S.D.; cofundadora de Neurotech; fundadora y directora de Ecoaldeas Kiryus y de la Fundación Nueva Humanidad.</p></article>
      </div>
    </div></section>

    <section className="founder-legacy"><div className="shell founder-legacy__grid"><div><SectionEyebrow>Publicaciones e iniciativas</SectionEyebrow><h2>Ideas llevadas a libros, métodos y comunidad.</h2><p>Su trabajo conecta formación, práctica corporal, comprensión de la mente y proyectos orientados al desarrollo humano.</p></div><div className="founder-legacy__list"><article><BookOpen /><div><span>Autora</span><strong>“Saltar ahora, es salud”</strong><strong>“Transforma tu biocomputadora”</strong><strong>“Soy Guerrero, Soy Luz”</strong></div></article><article><Users /><div><span>Dirección y comunidad</span><strong>Gimnasio del Cerebro</strong><strong>Comunidades de Amor</strong><strong>Fundación Nueva Humanidad</strong></div></article></div></div></section>

    <section className="about-approach"><div className="shell"><div className="section-heading section-heading--split"><div><SectionEyebrow>Nuestro enfoque</SectionEyebrow><h2>Una propuesta educativa, práctica y humana.</h2></div><p>Integramos herramientas de neurociencia y aprendizaje con una perspectiva conceptual inspirada en la física cuántica, presentada de manera responsable y sin sustituir atención médica o psicológica.</p></div><div className="approach-grid"><article><BrainCircuit /><h3>Neurociencia y aprendizaje</h3><p>Conceptos para comprender atención, hábitos, respuestas y procesos de aprendizaje.</p></article><article><Compass /><h3>Práctica consciente</h3><p>La información se convierte en observación, entrenamiento y acciones aplicables.</p></article><article><Atom /><h3>Perspectiva cuántica</h3><p>Una mirada conceptual sobre posibilidades e interconexión, sin presentarla como tratamiento clínico.</p></article><article><Users /><h3>Comunidad</h3><p>Personas, facilitadores y proyectos asociados que aprenden y evolucionan juntos.</p></article></div></div></section>
  </>;
}
