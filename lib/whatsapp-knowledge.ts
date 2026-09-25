import type { WhatsAppCatalog, WhatsAppCatalogItem } from "./catalog-service";

// Editorial source: the descriptions supplied by GDC on 25 September 2026.
// This is information for the assistant, NOT a seed of purchasable products.
export type WhatsAppKnowledgeEntry = {
  id: string;
  name: string;
  emoji: string;
  kind: "PROGRAM" | "TOOL" | "BOOK";
  aliases: string[];
  excluded?: string[];
  summary: string;
  situation: string;
  proposal: string;
  practice: string[];
  format?: string;
  framing?: string;
  question: string;
};

export const WHATSAPP_KNOWLEDGE: WhatsAppKnowledgeEntry[] = [
  {
    id: "super-cerebro", name: "Super Cerebro", emoji: "🧠", kind: "PROGRAM",
    aliases: ["super cerebro", "supercerebro"], excluded: ["master class", "masterclass"],
    summary: "Integra Neurofitness Active, Neurotraumas y Brain Full Training para comprender patrones, creencias y respuestas automáticas y liderarte con mayor conciencia.",
    situation: "A veces reconoces que quieres cambiar, pero tus pensamientos, emociones y respuestas automáticas parecen ir en otra dirección.",
    proposal: "Super Cerebro es un programa que integra Neurofitness Active, Neurotraumas y Brain Full Training. Propone comprender cómo funciona tu cerebro, reconocer heridas, patrones y creencias, y desarrollar herramientas de autogestión, equilibrio y claridad.",
    practice: ["Neurofitness Active: autoobservación, reconocimiento de patrones y acción consciente.", "Neurotraumas: observar qué activa tus respuestas automáticas y trabajar sobre ellas desde la autoconsciencia.", "Brain Full Training: practicar foco, atención, memoria, control y flexibilidad."],
    framing: "No confundir este programa integral con una Master Class de nombre parecido. Su duración, acceso y precio no fueron confirmados en la descripción editorial.",
    question: "¿Quieres conocer el programa integral o profundizar en alguno de sus tres entrenamientos?",
  },
  {
    id: "neurofitness-active", name: "Neurofitness Active", emoji: "🧠", kind: "PROGRAM",
    aliases: ["neurofitness active", "neurofitness", "nfa"], excluded: ["express", "cartas", "neurotrainer", "maestria"],
    summary: "Observa tu BIO-COMPUTADORA, reconoce patrones y entrena la autogestión para crear respuestas más conscientes.",
    situation: "¿Sabes lo que te gustaría hacer, pero vuelves a reaccionar igual? A veces cambian las circunstancias, pero se repiten conflictos, miedos, pensamientos o hábitos.",
    proposal: "Neurofitness Active es un entrenamiento de autogestión y autoconsciencia. Desde el enfoque del GDC, la BIO-COMPUTADORA es una forma de hablar del funcionamiento del cerebro y de los patrones aprendidos. La propuesta es observar qué piensas, sientes y haces, reconocer qué está influyendo en tus resultados y practicar una respuesta diferente.",
    practice: ["Autoobservación: identificar pensamientos, emociones y acciones frente a situaciones reales.", "Reconocimiento de patrones: observar creencias y respuestas automáticas que se repiten.", "Comprensión: explorar por qué ciertas situaciones activan determinadas reacciones.", "Autogestión: hacer una pausa y elegir cómo responder con mayor conciencia.", "Acción consciente: convertir lo comprendido en decisiones y ejercicios cotidianos."],
    question: "¿Hay alguna situación o patrón que te gustaría aprender a gestionar de otra manera?",
  },
  {
    id: "neurotraumas", name: "Neurotraumas", emoji: "⚡", kind: "PROGRAM",
    aliases: ["neurotraumas", "neurotrauma"], excluded: ["express", "maestria"],
    summary: "Explora miedos y respuestas automáticas para comprender qué los activa y trabajar en su gestión desde la autoconsciencia.",
    situation: "Algunas situaciones pueden activar miedo, bloqueo o tensión con una intensidad difícil de comprender, incluso cuando sientes que lo sucedido ya pasó.",
    proposal: "Neurotraumas propone reconocer y trabajar esas respuestas desde la autoobservación consciente y la autogestión. No se trata solo de recordar lo vivido, sino de observar qué se activa en el presente y desarrollar recursos para responder de otra manera.",
    practice: ["Autoobservación: reconocer situaciones que activan respuestas físicas, emocionales o automáticas.", "Identificación: explorar la posible relación entre una reacción actual y experiencias pasadas, sin autodiagnosticarse.", "Comprensión: observar cómo esos patrones pueden influir en decisiones y resultados.", "Herramientas de autogestión: practicar respuestas más flexibles y conscientes.", "Integración: ejercicios, casos y un plan de acción para situaciones cotidianas."],
    framing: "El programa describe su trabajo como desensibilización de traumas. Preséntalo como su propuesta educativa, no como tratamiento clínico probado ni promesa de eliminar traumas. El modelo del cerebro reptil pertenece a su marco explicativo, no es una explicación neurocientífica establecida. No sustituye atención psicológica o médica.",
    question: "¿Te interesa conocer cómo se trabaja la autoobservación en este entrenamiento?",
  },
  {
    id: "brain-full-training", name: "Brain Full Training", emoji: "🎯", kind: "PROGRAM",
    aliases: ["brain full training", "brainful training", "brainfull training", "bft"],
    summary: "Practica sentidos internos, foco, atención, memoria, control y flexibilidad para responder con mayor presencia en tu vida cotidiana.",
    situation: "Si te distraes fácilmente, pierdes el foco, reaccionas antes de pensar o te cuesta adaptarte a cambios, puede interesarte practicar estas capacidades de forma consciente.",
    proposal: "Brain Full Training es un entrenamiento práctico de capacidades que utilizas al percibir, procesar información, recordar y tomar decisiones. El GDC lo presenta como un entrenamiento orientado al Neocórtex: su propuesta va más allá de resolver ejercicios y busca llevar la práctica al día a día.",
    practice: ["Sentidos internos: observar señales internas y la información que percibes.", "Foco: dirigir la atención hacia una tarea elegida.", "Atención: practicar presencia y concentración sostenida.", "Memoria: ejercitar el registro, la retención y la recuperación de información.", "Control: hacer una pausa antes de una respuesta automática.", "Flexibilidad: cambiar de regla, estrategia o perspectiva cuando cambian las condiciones."],
    framing: "Describe habilidades y ejercicios, no una mejora cerebral garantizada ni una evaluación de inteligencia o un tratamiento de trastornos de atención.",
    question: "¿Qué te gustaría practicar primero: foco, memoria, control o flexibilidad?",
  },
  {
    id: "neuroconstelaciones", name: "Neuroconstelaciones", emoji: "🌳", kind: "PROGRAM",
    aliases: ["neuroconstelaciones", "neuroconstelacion"], excluded: ["holograficas", "holografica", "express"],
    summary: "Explora patrones heredados y dinámicas familiares que pueden influir en relaciones, decisiones y resultados, desde el enfoque del GDC.",
    situation: "A veces sientes que se repiten dificultades en tus vínculos o decisiones y quieres observar qué relación tienen con tu historia familiar.",
    proposal: "Neuroconstelaciones integra constelaciones familiares, Neurofitness Active y Neurotraumas dentro de la propuesta del GDC. Invita a explorar patrones, lealtades y dinámicas familiares desde la autoobservación, para elegir respuestas más conscientes.",
    practice: ["Introducción a las constelaciones familiares y a la mirada sistémica del programa.", "Exploración de lealtades familiares, patrones transgeneracionales y relaciones de pareja.", "Órdenes del amor como concepto del enfoque de constelaciones.", "Observación del lenguaje corporal y espacial.", "Integración de herramientas de Neurofitness Active y Neurotraumas.", "Ética del Neuroconstelador y práctica integrativa."],
    framing: "Está orientado a personas interesadas en su proceso y a acompañantes que desean ampliar herramientas. Las lealtades y dinámicas transgeneracionales se presentan como el marco interpretativo del programa, no como causas clínicas demostradas. No atribuir enfermedades a la familia ni inventar certificaciones o habilitaciones profesionales.",
    question: "¿Buscas explorar tu proceso personal o conocer las herramientas de acompañamiento?",
  },
  {
    id: "neuroconstelaciones-holograficas-express", name: "Neuroconstelaciones Holográficas Express", emoji: "✨", kind: "PROGRAM",
    aliases: ["neuroconstelaciones holograficas express", "constelaciones holograficas express", "holograficas express"],
    summary: "Una experiencia práctica para identificar bloqueos, resignificarlos y trabajar en nuevas posibilidades desde la autogestión.",
    situation: "Puedes sentir que algo te frena, que una situación se repite o que quieres avanzar y no logras identificar qué está interfiriendo.",
    proposal: "Neuroconstelaciones Holográficas Express propone un método de autogestión y autoconsciencia para observar un bloqueo, explorar su significado, resignificarlo y convertir esa comprensión en una acción consciente.",
    practice: ["Identificar la situación, emoción o patrón que quieres trabajar.", "Explorar el campo morfogenético, el doble cuántico y la línea del tiempo cuántica como herramientas del marco propuesto por GDC.", "Trabajar la liberación, resignificación y reprogramación del bloqueo dentro de esa metodología.", "Integrar lo observado en decisiones y un plan de acción personal."],
    format: "Según la información facilitada por GDC: 45 clases, materiales descargables (La Rueda del Alma, El Reloj Emocional y Tarjetas Holográficas), ejercicios de conexión, módulo de preguntas frecuentes y acceso vitalicio a través de Hotmart.",
    framing: "Campo morfogenético, doble cuántico y línea del tiempo cuántica son conceptos de esta metodología, no mecanismos científicos demostrados ni tratamientos médicos. No equiparar este Express con el taller o con otro programa de nombre similar para ofrecer precios o enlaces.",
    question: "¿Quieres que te cuente más sobre los ejercicios o sobre los materiales incluidos?",
  },
  {
    id: "algoritmos-pedagogicos", name: "Algoritmos Pedagógicos", emoji: "🔢", kind: "PROGRAM",
    aliases: ["algoritmos pedagogicos", "algoritmos pedagogico", "algoritmos", "alp"],
    summary: "Profundiza en creencias, aprendizajes y patrones que intervienen en cómo interpretas tus experiencias y eliges actuar.",
    situation: "Tal vez has estudiado o trabajado mucho en ti, pero sientes que ciertas experiencias se repiten o que tu comprensión no se traduce en resultados diferentes.",
    proposal: "Algoritmos Pedagógicos, guiado por Marisa Cardozo, propone explorar la relación entre creencias, emociones, experiencias y resultados. Desde el marco del GDC, busca comprender qué aprendizaje puede encontrarse en una situación y redirigir pensamientos, emociones y acciones de forma más consciente.",
    practice: ["Observar creencias y respuestas automáticas que pueden condicionar tu interpretación.", "Explorar experiencias y traumas desde la autoobservación, sin diagnosticar.", "Ley del espejo y leyes del Universo y de la experiencia humana como marco interpretativo del programa.", "Identificar aprendizajes e integrar nuevas perspectivas.", "Practicar autogestión y redirección consciente de decisiones y acciones.", "Co-creación como concepto del GDC para participar conscientemente en la vida que eliges construir."],
    format: "Formato de continuidad semanal con nueva información para profundizar la comprensión y la autoconsciencia.",
    framing: "El GDC presenta sus algoritmos como fórmulas que rigen aprendizajes. Atribuye esa explicación a la metodología: no afirmar que son leyes matemáticas o universales científicamente demostradas, ni ubicar creencias y traumas de forma literal en un cerebro límbico o reptil. No responsabilizar a alguien de haber causado un trauma o enfermedad.",
    question: "¿Te interesa comprender un patrón que se repite o conocer cómo es la continuidad semanal?",
  },
  {
    id: "neurotrainer", name: "Neurotrainer – Formación de Neuroentrenadores", emoji: "🎓", kind: "PROGRAM",
    aliases: ["neurotrainer", "formacion de neuroentrenadores", "neuroentrenadores", "neurotrainer maestria"],
    summary: "Desarrolla herramientas para acompañar procesos de transformación utilizando las metodologías del GDC.",
    situation: "Si quieres profundizar en las herramientas del GDC y conocer su aplicación en el acompañamiento de otras personas, esta es su propuesta de formación.",
    proposal: "Neurotrainer – Formación de Neuroentrenadores propone desarrollar herramientas para acompañar procesos de transformación mediante las metodologías del Gimnasio del Cerebro.",
    practice: ["Profundizar en el enfoque del GDC y sus herramientas de autogestión.", "Explorar su aplicación al acompañamiento de procesos personales."],
    framing: "La información editorial no confirma temario completo, duración, requisitos, certificación ni habilitación sanitaria. No inventarlos ni presentar esta formación como un título clínico.",
    question: "¿Te gustaría que el equipo confirme los requisitos y el formato actual de la formación?",
  },
  {
    id: "cartas-neurofitness", name: "Cartas “5 Pasos · 9 Retos”", emoji: "🃏", kind: "TOOL",
    aliases: ["cartas 5 pasos 9 retos", "5 pasos 9 retos", "cartas neurofitness active", "cartas neurofitness", "cartas"],
    summary: "Una guía práctica para aplicar Neurofitness Active a situaciones reales, observar patrones y entrenar una respuesta consciente.",
    situation: "Puedes comprender una herramienta en una clase y, ante un conflicto, una emoción intensa o una decisión difícil, preguntarte: «¿y ahora cómo la aplico?».",
    proposal: "Las Cartas 5 Pasos · 9 Retos facilitan la aplicación de Neurofitness Active en la vida cotidiana. Son una guía para observar lo que estás viviendo, reconocer la información que interviene y practicar una respuesta diferente; no solo una lectura para reflexionar.",
    practice: ["Autoobservación: detenerte y reconocer qué ocurre dentro de ti.", "Identificación del reto y de pensamientos, creencias, emociones o patrones implicados.", "Aplicación de los 5 pasos de la metodología de Neurofitness Active.", "Práctica frente a los 9 retos como oportunidades de aprendizaje.", "Autogestión y acción consciente: convertir la comprensión en una decisión o conducta diferente.", "Práctica cotidiana fuera de una clase o entrenamiento formal."],
    question: "¿Ya practicas Neurofitness Active o quieres saber cómo empezar a utilizar las cartas?",
  },
  {
    id: "libro-transforma", name: "Transforma tu Biocomputadora", emoji: "📘", kind: "BOOK",
    aliases: ["transforma tu biocomputadora", "libro transforma tu bio computadora", "transforma tu bio computadora"],
    summary: "Un libro para comprender patrones aprendidos y comenzar a entrenar una manera más consciente de pensar, sentir y actuar.",
    situation: "A veces sabes que quieres cambiar un hábito, pensamiento o reacción, pero no entiendes cómo se fue formando ni por dónde empezar.",
    proposal: "Transforma tu Biocomputadora es un libro que utiliza la metáfora de la BIO-COMPUTADORA para explorar pensamientos, emociones, hábitos y programaciones aprendidas. Invita a reconocer patrones y comenzar a llevar la autoobservación a acciones concretas.",
    practice: ["Comprender la metáfora de la BIO-COMPUTADORA y observar tu propio funcionamiento.", "Reconocer pensamientos, creencias y respuestas automáticas.", "Explorar la relación entre interpretación, emoción y acción.", "Practicar autoobservación y autogestión en situaciones cotidianas.", "Elegir pequeños cambios conscientes en tu manera de pensar, sentir y actuar."],
    framing: "Es un LIBRO. No confundirlo con un curso homónimo del catálogo ni compartir el checkout de ese curso. La descripción no confirma autoría, edición, formato de entrega o precio del libro.",
    question: "¿Te gustaría conocer el enfoque del libro o consultar su disponibilidad?",
  },
  {
    id: "libro-guerrero", name: "Soy Guerrero Soy Luz", emoji: "📕", kind: "BOOK",
    aliases: ["soy guerrero soy luz", "soy guerrero", "guerrero soy luz"],
    summary: "Una lectura sobre recursos interiores, transformación personal y una vida más consciente, sin quedar definido por las dificultades vividas.",
    situation: "Después de experiencias difíciles, puede aparecer el deseo de recuperar confianza, reconocer tus recursos y dar un nuevo significado a tu historia.",
    proposal: "Soy Guerrero Soy Luz es un libro orientado al reconocimiento del poder interior y a la transformación personal. Propone mirar lo vivido sin quedar definido por ello y explorar nuevas maneras de relacionarte contigo y con tu propósito.",
    practice: ["Reconocer recursos internos, confianza y fortaleza personal.", "Observar creencias y significados asociados a experiencias difíciles.", "Explorar resiliencia y resignificación sin negar lo vivido.", "Conectar con un propósito y una mirada más consciente de tu vida.", "Llevar reflexiones y ejercicios a acciones de autoconocimiento."],
    framing: "Es un libro de desarrollo personal, no una promesa de curación. No se confirmaron autoría, edición, formato, disponibilidad ni precio.",
    question: "¿Quieres conocer más sobre su enfoque o consultar cómo conseguirlo?",
  },
];

export function normalizeKnowledgeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function containsWords(text: string, phrase: string) {
  return ` ${text} `.includes(` ${normalizeKnowledgeText(phrase)} `);
}

export function matchWhatsAppKnowledge(value: string) {
  const text = normalizeKnowledgeText(value);
  return WHATSAPP_KNOWLEDGE
    .filter((entry) => !entry.excluded?.some((term) => containsWords(text, term)))
    .flatMap((entry) => entry.aliases.filter((alias) => containsWords(text, alias)).map((alias) => ({ entry, length: alias.length })))
    .sort((a, b) => b.length - a.length)[0]?.entry;
}

export function publishedKnowledgeItem(entry: WhatsAppKnowledgeEntry, catalog: WhatsAppCatalog): WhatsAppCatalogItem | undefined {
  // Conservative matching: a similar title does not establish commercial equivalence.
  return catalog.allItems.find((item) => {
    if ((entry.kind === "PROGRAM") !== (item.type === "TRAINING")) return false;
    const name = normalizeKnowledgeText(item.name);
    const slug = normalizeKnowledgeText(item.slug);
    if (entry.excluded?.some((term) => containsWords(`${name} ${slug}`, term))) return false;
    return [entry.name, ...entry.aliases].some((alias) => [name, slug].includes(normalizeKnowledgeText(alias)));
  });
}

export function buildWhatsAppKnowledgeMenu(catalog: WhatsAppCatalog) {
  return [
    "Claro 😊 Soy el asistente automático del Gimnasio del Cerebro. Tenemos diferentes caminos de entrenamiento y herramientas para acompañar tu proceso:",
    ...WHATSAPP_KNOWLEDGE.map((entry) => `${entry.emoji} *${entry.name}:* ${entry.summary}`),
    `Puedes conocer nuestros entrenamientos aquí:\n${catalog.catalogUrl}`,
    "También podemos orientarte sobre consultas con Marisa Cardozo y BioShield by Kirius. Los precios y la disponibilidad se confirman para cada opción.",
    "💙 Cuéntame qué quieres trabajar o desarrollar y te ayudo a encontrar la opción que mejor se conecta con tu proceso.",
  ].join("\n\n");
}

export function buildWhatsAppKnowledgeReply(entry: WhatsAppKnowledgeEntry, catalog: WhatsAppCatalog) {
  const item = publishedKnowledgeItem(entry, catalog);
  return [
    `${entry.emoji} *${entry.name}*`, entry.situation,
    `*¿Qué propone?*\n${entry.proposal}`,
    `*¿Qué practicas?*\n${entry.practice.map((point) => `• ${point}`).join("\n")}`,
    entry.format,
    ["neurotraumas", "neuroconstelaciones", "neuroconstelaciones-holograficas-express"].includes(entry.id)
      ? "Es una propuesta de desarrollo personal del GDC; no sustituye atención médica o psicológica." : undefined,
    item ? `Puedes conocer esta opción aquí:\n${item.acquisitionUrl}` : "Si te interesa acceder, podemos consultar con el equipo su disponibilidad y el enlace correcto.",
    entry.question,
  ].filter(Boolean).join("\n\n");
}

export function getWhatsAppKnowledgeSelection(message: string) {
  // Only a simple selection/info request gets a fixed explanation. Specific
  // questions, comparisons, negations and follow-ups keep the full AI history.
  const text = normalizeKnowledgeText(message)
    .replace(/^(?:hola|buenos dias|buenas tardes|buenas noches)\s+/, "")
    .replace(/^(?:me interesa|elijo|quiero conocer|quiero saber sobre|quiero informacion (?:de|del|sobre)|informacion (?:de|del|sobre)|cuentame (?:de|del|sobre)|hablame (?:de|del|sobre)|que es|que son|quiero)\s+/, "")
    .replace(/^(?:el programa|el libro)\s+/, "")
    .replace(/^las cartas(?:\s+|$)/, "cartas ")
    .replace(/\s+por favor$/, "");
  return WHATSAPP_KNOWLEDGE.find((entry) => [entry.name, ...entry.aliases].some((alias) => normalizeKnowledgeText(alias) === text.trim()));
}

export function whatsAppKnowledgeContext(catalog: WhatsAppCatalog) {
  return [
    "BASE EDITORIAL GDC — DESCRIPCIONES REVISADAS EL 25/09/2026",
    "Estas descripciones prevalecen sobre resúmenes antiguos del catálogo para explicar contenidos. Son propuestas del GDC, no diagnósticos ni evidencia clínica. No confirman por sí mismas que una opción esté a la venta. Precios, fechas y URLs proceden exclusivamente del catálogo dinámico del producto exacto. No mezcles versiones Express, talleres, programas integrales, Master Class ni libros con cursos homónimos.",
    ...WHATSAPP_KNOWLEDGE.map((entry) => {
      const item = publishedKnowledgeItem(entry, catalog);
      return [
        `### ${entry.name} (${entry.kind === "BOOK" ? "LIBRO" : entry.kind === "TOOL" ? "HERRAMIENTA" : "ENTRENAMIENTO"})`,
        `También se menciona como: ${entry.aliases.join(", ")}`,
        `Situación que aborda: ${entry.situation}`, `Propuesta: ${entry.proposal}`,
        `Práctica/contenido:\n${entry.practice.map((point) => `- ${point}`).join("\n")}`,
        entry.format ? `Formato facilitado por GDC: ${entry.format}` : "Formato, duración y acceso: no confirmados en la base editorial.",
        entry.framing ? `Límites de interpretación: ${entry.framing}` : undefined,
        item ? `Correspondencia comercial verificada: ${item.name}. Precio: ${item.price}. Enlace exacto: ${item.acquisitionUrl}` : "SIN CORRESPONDENCIA COMERCIAL VERIFICADA: explica su contenido, pero no ofrezcas un precio o checkout de otra opción. Ofrece consultar con el equipo.",
        `Pregunta de orientación posible: ${entry.question}`,
      ].filter(Boolean).join("\n");
    }),
  ].join("\n\n");
}
