import bcrypt from "bcryptjs";
import { getRuntimeDatabase, isDatabaseUnavailable, type AppDatabase } from "./runtime";
import { getRuntimeValues } from "../lib/runtime-env";
import { buildPurchaseEmail, PURCHASE_EMAIL_RETRYABLE_PREFIX, sendPurchaseConfirmation } from "../lib/purchase-email";

export type AdminRole = "SUPERADMIN" | "EDITOR" | "COMERCIAL";

export type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
};

export type Training = {
  id: string;
  name: string;
  acronym: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  logo: string;
  heroImage: string | null;
  resourceUrl: string | null;
  dashboardContent: string | null;
  checkoutProvider: "STRIPE" | "HOTMART" | "MANUAL";
  checkoutUrl: string | null;
  checkoutExternalId?: string | null;
  priceCents: number;
  currency: string;
  status: string;
  displayOrder: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  attachmentUrl: string | null;
  author: string | null;
  category: string;
  publishedAt: string | null;
  status: string;
};

export type Testimonial = {
  id: string;
  name: string;
  program: string | null;
  quote: string;
  videoUrl: string;
  thumbnail: string;
  rating: number | null;
  visible: boolean;
  displayOrder: number;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  trainingInterest: string | null;
  message: string;
  source: string;
  status: string;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  preferredDate: string;
  preferredTime: string;
  trainingInterest: string | null;
  appointmentType: "CONSULTATION" | "TRAINING";
  disclaimerAcceptedAt: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  priceLabel: string;
  discountLabel: string | null;
  resourceUrl: string | null;
  dashboardContent: string | null;
  checkoutProvider: "STRIPE" | "HOTMART" | "MANUAL";
  checkoutUrl: string | null;
  checkoutExternalId?: string | null;
  priceCents: number;
  currency: string;
  status: string;
  displayOrder: number;
};

export type Payment = {
  id: string;
  reference: string;
  payerName: string;
  payerEmail: string | null;
  payerPhone: string | null;
  customerId: string | null;
  concept: string;
  itemType: string;
  itemId: string | null;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  providerReference: string | null;
  status: string;
  paidAt: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  startsAt: string;
  location: string;
  registrationUrl: string | null;
  status: string;
  displayOrder: number;
};

export type Associate = {
  id: string;
  name: string;
  url: string;
  description: string;
  image: string | null;
  status: string;
  displayOrder: number;
};

export type PublicNotification = {
  id: string;
  title: string;
  detail: string;
  href: string;
  kind: "event" | "discount";
};

export type WhatsAppConversation = {
  id: string;
  jid: string;
  phoneNumber: string;
  contactName: string;
  mode: "AI" | "HUMAN";
  productInterest: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type WhatsAppMessage = {
  id: string;
  conversationId: string;
  providerMessageId: string | null;
  direction: "INBOUND" | "OUTBOUND";
  senderType: "CONTACT" | "AI" | "HUMAN";
  content: string;
  deliveryStatus: string;
  createdAt: string;
};

export const associateSeeds: Associate[] = [{
  id: "associate-kiryus",
  name: "Comunidad Kiryus",
  url: "https://www.comunidadkiryus.org/",
  description: "Red de ecoaldeas autosustentables orientada a la permacultura, la regeneración ambiental, la sostenibilidad y la vida colaborativa.",
  image: "/logos/kiryus-official-v2.png",
  status: "PUBLISHED",
  displayOrder: 1,
}];

export const productSeeds: Product[] = [
  {
    id: "product-bioshield-kirius",
    name: "BioShield by Kirius",
    slug: "bioshield-by-kirius",
    description: "Una propuesta de Kiryus que se incorpora al catálogo de Gimnasio del Cerebro. Próximamente publicaremos su presentación, beneficios, disponibilidad y forma de adquisición.",
    image: null,
    priceLabel: "Información próximamente",
    discountLabel: "Nuevo",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás la información y los recursos habilitados para BioShield by Kiryus.",
    checkoutProvider: "MANUAL",
    checkoutUrl: null,
    priceCents: 0,
    currency: "USD",
    status: "HIDDEN",
    displayOrder: 1,
  },
  {
    id: "product-neurofitness-cards",
    name: "Cartas Neurofitness Active",
    slug: "cartas-neurofitness-active",
    description: "Un recurso práctico para activar preguntas, ejercicios y conversaciones que ayudan a entrenar la atención, la comprensión y la autogestión.",
    image: "/images/catalog/cartas-neurofitness-active-hotmart-600x600.png",
    priceLabel: "Venta activa en Hotmart",
    discountLabel: null,
    resourceUrl: null,
    dashboardContent: "Desde aquí encontrarás las indicaciones, novedades y materiales digitales habilitados para las Cartas Neurofitness Active.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/V96727899W",
    checkoutExternalId: "4768798",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 2,
  },
  {
    id: "product-gdc-cap",
    name: "BioShield by KIRYUS™",
    slug: "gorro-gimnasio-del-cerebro",
    description: "Un gorro técnico de edición Founder creado por KIRYUS para acompañar momentos de enfoque, pausa y presencia.",
    image: "/images/bioshield/hero-wellness.png",
    priceLabel: "Precio mostrado por Stripe",
    discountLabel: "Edición Founder",
    resourceUrl: null,
    dashboardContent: "Información de compra, cuidados, entrega y acceso al kit digital de BioShield by KIRYUS™.",
    checkoutProvider: "STRIPE",
    checkoutUrl: "https://buy.stripe.com/6oU3cvb3E9GYglgcNB97H03",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 3,
  },
];

export const trainingSeeds: Training[] = [
  {
    id: "training-nfa",
    name: "Neurofitness Active",
    acronym: "NFA",
    slug: "neurofitness-active",
    shortDescription: "Entrenamiento base orientado a comprender el funcionamiento de la mente y desarrollar capacidades de autogestión.",
    fullDescription: "Un punto de partida para observar el funcionamiento de la mente, reconocer patrones y desarrollar herramientas de autogestión aplicables a la vida cotidiana.",
    logo: "/logos/nfa-full-v2.jpg",
    heroImage: "/images/catalog/covers/neurofitness-active-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "6856229",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 1,
  },
  {
    id: "training-ntr",
    name: "Neurotraumas",
    acronym: "NTR",
    slug: "neurotraumas",
    shortDescription: "Herramientas para detectar, comprender y trabajar bloqueos que condicionan las respuestas emocionales.",
    fullDescription: "Una propuesta para identificar bloqueos profundos y comprender cómo influyen en nuestras respuestas emocionales, utilizando el contenido actual del programa.",
    logo: "/logos/ntr-full-v2.jpg",
    heroImage: "/images/catalog/covers/neurotraumas-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "6856491",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 2,
  },
  {
    id: "training-bft",
    name: "Brain Full Training",
    acronym: "BFT",
    slug: "brain-full-training",
    shortDescription: "Recorrido integral por los principales entrenamientos para acelerar el proceso de transformación personal.",
    fullDescription: "Un recorrido integral por los principales entrenamientos de Gimnasio del Cerebro, organizado para profundizar el proceso de transformación personal.",
    logo: "/logos/bft-full-v2.jpg",
    heroImage: "/images/catalog/covers/brain-full-training-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "MANUAL",
    checkoutUrl: null,
    priceCents: 0,
    currency: "BOB",
    status: "PUBLISHED",
    displayOrder: 3,
  },
  {
    id: "training-ntm",
    name: "Neurotrainer – Maestría en Neurofitness Active",
    acronym: "NTM",
    slug: "neurotrainer-maestria",
    shortDescription: "Formación avanzada para profundizar en el método y acompañar procesos de transformación.",
    fullDescription: "Formación avanzada dirigida a quienes desean profundizar en el método de Neurofitness Active y acompañar procesos de transformación.",
    logo: "/logos/ntm-full-v2.jpg",
    heroImage: "/images/catalog/covers/neurotrainer-maestria-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "MANUAL",
    checkoutUrl: null,
    priceCents: 0,
    currency: "BOB",
    status: "PUBLISHED",
    displayOrder: 4,
  },
  {
    id: "training-alp",
    name: "Algoritmos Pedagógicos",
    acronym: "ALP",
    slug: "algoritmos-pedagogicos",
    shortDescription: "Metodologías para comprender y optimizar procesos de aprendizaje desde una perspectiva neurocientífica y pedagógica.",
    fullDescription: "Metodologías orientadas a comprender y optimizar procesos de aprendizaje desde una perspectiva neurocientífica y pedagógica.",
    logo: "/logos/alp-full-v2.jpg",
    heroImage: "/images/catalog/covers/algoritmos-pedagogicos-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "5686905",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 5,
  },
  {
    id: "training-nco",
    name: "Neuroconstelaciones Holográficas",
    acronym: "NCO",
    slug: "neuroconstelaciones-holograficas",
    shortDescription: "Herramientas para identificar bloqueos profundos y ampliar nuevas posibilidades de desarrollo.",
    fullDescription: "Herramientas orientadas a identificar bloqueos profundos y ampliar nuevas posibilidades de desarrollo personal.",
    logo: "/logos/nco-full-v2.jpg",
    heroImage: "/images/catalog/covers/neuroconstelaciones-holograficas-v3.png",
    resourceUrl: null,
    dashboardContent: null,
    checkoutProvider: "MANUAL",
    checkoutUrl: null,
    priceCents: 0,
    currency: "BOB",
    status: "PUBLISHED",
    displayOrder: 6,
  },
  {
    id: "training-nfa-express",
    name: "Neurofitness Active Express",
    acronym: "CURSO",
    slug: "neurofitness-active-express",
    shortDescription: "Una experiencia concentrada para conocer y comenzar a aplicar herramientas esenciales de Neurofitness Active.",
    fullDescription: "Curso en formato express para observar patrones mentales, comprender respuestas automáticas y comenzar un entrenamiento consciente con herramientas prácticas del método Neurofitness Active.",
    logo: "/logos/nfa-full-v2.jpg",
    heroImage: "/images/catalog/covers/neurofitness-active-express-v3.png",
    resourceUrl: null,
    dashboardContent: "Bienvenida al curso Neurofitness Active Express. Aquí aparecerán tus indicaciones de acceso, materiales y próximos pasos.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/I95298513M",
    checkoutExternalId: "4473112",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 20,
  },
  {
    id: "training-neuroreto-merecimiento",
    name: "Neuroreto: 21 días de merecimiento",
    acronym: "RETO",
    slug: "neuroreto-21-dias-merecimiento",
    shortDescription: "Un recorrido guiado de 21 días para observar creencias, reconocer el propio valor y entrenar una relación más consciente con el merecimiento.",
    fullDescription: "Programa de 21 días con propuestas breves y progresivas para explorar el merecimiento desde la observación personal, el aprendizaje consciente y la práctica cotidiana.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/neuroreto-21-dias-merecimiento-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás el acceso y los materiales correspondientes a los 21 días del Neuroreto de Merecimiento.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/A102005977H",
    checkoutExternalId: "6288280",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 21,
  },
  {
    id: "training-neuroreto-feliz-eficiente",
    name: "Neuroreto: Sé feliz y eficiente",
    acronym: "RETO",
    slug: "neuroreto-se-feliz-y-eficiente",
    shortDescription: "Veintiún días para entrenar hábitos, atención y decisiones que favorezcan una vida más consciente, organizada y satisfactoria.",
    fullDescription: "Un recorrido práctico de 21 días para observar la manera en que organizamos energía, atención y prioridades, incorporando ejercicios de aprendizaje consciente.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/neuroreto-se-feliz-y-eficiente-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás el acceso, las indicaciones y los materiales de cada etapa del Neuroreto Sé feliz y eficiente.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/V95461171E",
    checkoutExternalId: "4505399",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 22,
  },
  {
    id: "training-neurotraumas-express",
    name: "Neurotraumas Express",
    acronym: "CURSO",
    slug: "neurotraumas-express",
    shortDescription: "Introducción concentrada para reconocer bloqueos y comprender cómo ciertos aprendizajes condicionan nuestras respuestas.",
    fullDescription: "Curso express de carácter educativo para observar patrones, reconocer bloqueos y explorar nuevas respuestas. No sustituye psicoterapia, diagnóstico ni tratamiento médico.",
    logo: "/logos/ntr-full-v2.jpg",
    heroImage: "/images/catalog/covers/neurotraumas-express-v3.png",
    resourceUrl: null,
    dashboardContent: "Bienvenida a Neurotraumas Express. Aquí se habilitarán las instrucciones, materiales y acceso al programa.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/J95306140W",
    checkoutExternalId: "4474668",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 23,
  },
  {
    id: "training-tabla-radionica",
    name: "Tabla Radiónica del Cerebro",
    acronym: "CURSO",
    slug: "tabla-radionica-del-cerebro",
    shortDescription: "Una propuesta educativa para explorar patrones, intención y observación personal mediante una herramienta visual estructurada.",
    fullDescription: "Curso introductorio sobre el uso conceptual de la Tabla Radiónica del Cerebro dentro de las propuestas educativas de Gimnasio del Cerebro.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/tabla-radionica-del-cerebro-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí aparecerán las instrucciones, materiales y recursos habilitados para Tabla Radiónica del Cerebro.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/L95306409R",
    checkoutExternalId: "4474702",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 24,
  },
  {
    id: "training-super-cerebro-master-class",
    name: "Super Cerebro — Master Class",
    acronym: "CURSO",
    slug: "super-cerebro-master-class",
    shortDescription: "Una clase intensiva para entrenar atención, memoria, aprendizaje y agilidad mental con herramientas prácticas.",
    fullDescription: "Master class educativa de Gimnasio del Cerebro para comprender mejor cómo aprendemos y aplicar recursos de atención, memoria y organización mental en la vida cotidiana.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/super-cerebro-master-class-v3.png",
    resourceUrl: null,
    dashboardContent: "Bienvenida a Super Cerebro — Master Class. Aquí se habilitarán el acceso, las indicaciones y los materiales de la clase.",
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "8224669",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 25,
  },
  {
    id: "training-taller-neuroconstelaciones",
    name: "Taller Neuroconstelaciones Holográficas",
    acronym: "TALLER",
    slug: "taller-neuroconstelaciones-holograficas",
    shortDescription: "Taller para observar vínculos, patrones y bloqueos desde la propuesta educativa de Neuroconstelaciones Holográficas.",
    fullDescription: "Una experiencia de aprendizaje y observación personal orientada a reconocer relaciones y patrones desde el enfoque de Neuroconstelaciones Holográficas.",
    logo: "/logos/nco-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-neuroconstelaciones-holograficas-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí se publicarán el acceso, las indicaciones y los materiales del taller Neuroconstelaciones Holográficas.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/R98649973E",
    checkoutExternalId: "5219876",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 30,
  },
  {
    id: "training-taller-autohipnosis-seguridad",
    name: "Taller Autohipnosis: Encuentra tu seguridad interior",
    acronym: "TALLER",
    slug: "taller-autohipnosis-seguridad-interior",
    shortDescription: "Prácticas educativas de atención y autosugestión consciente orientadas a fortalecer recursos internos y seguridad personal.",
    fullDescription: "Taller educativo de autohipnosis y atención consciente. No sustituye psicoterapia, diagnóstico, tratamiento médico ni atención de emergencia.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-autohipnosis-seguridad-interior-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí aparecerán las indicaciones, audios y materiales habilitados para el taller Encuentra tu seguridad interior.",
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "4925729",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 31,
  },
  {
    id: "training-taller-autohipnosis-medio",
    name: "Taller Autohipnosis: Nivel medio",
    acronym: "TALLER",
    slug: "taller-autohipnosis-nivel-medio",
    shortDescription: "Continuidad práctica para profundizar la atención, la autosugestión consciente y el entrenamiento de recursos internos.",
    fullDescription: "Nivel medio del taller educativo de autohipnosis. Requiere revisar las indicaciones previas y no sustituye atención psicológica o médica profesional.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-autohipnosis-nivel-medio-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí se habilitarán las indicaciones, audios y materiales del nivel medio de Autohipnosis.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/K97596526D",
    checkoutExternalId: "4971920",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 32,
  },
  {
    id: "training-taller-neurosexualidad",
    name: "Taller Neurosexualidad",
    acronym: "TALLER",
    slug: "taller-neurosexualidad",
    shortDescription: "Un espacio educativo para explorar comunicación, vínculos, cuerpo y consciencia desde una mirada respetuosa e integradora.",
    fullDescription: "Taller educativo para personas adultas centrado en aprendizaje, comunicación y consciencia. No constituye atención clínica ni terapia sexual.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-neurosexualidad-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás el acceso, las indicaciones y los materiales del Taller Neurosexualidad.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/D102655163J",
    checkoutExternalId: "6527283",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 33,
  },
  {
    id: "training-taller-recordarme",
    name: "Taller online: Recordarme desde adentro",
    acronym: "TALLER",
    slug: "taller-recordarme-desde-adentro",
    shortDescription: "Una experiencia de introspección para reconocer la propia historia, recuperar presencia y observarse con mayor claridad.",
    fullDescription: "Taller online de desarrollo personal con ejercicios de observación, escritura y aprendizaje consciente.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-recordarme-desde-adentro-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí se habilitarán el acceso y los materiales del taller Recordarme desde adentro.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/B101203465Q",
    checkoutExternalId: "6012007",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 34,
  },
  {
    id: "training-taller-cerrando-ciclos",
    name: "Taller Cerrando ciclos: El nacimiento del nuevo tú",
    acronym: "TALLER",
    slug: "taller-cerrando-ciclos-nuevo-tu",
    shortDescription: "Una propuesta para observar transiciones, integrar aprendizajes y abrir espacio a nuevas decisiones personales.",
    fullDescription: "Taller de desarrollo personal orientado a reconocer cierres, integrar experiencias y formular próximos pasos de manera consciente.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-cerrando-ciclos-nuevo-tu-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás el acceso y los materiales del taller Cerrando ciclos.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/H103140480D",
    checkoutExternalId: "6712419",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 35,
  },
  {
    id: "training-taller-autovaloracion",
    name: "Taller Autovaloración",
    acronym: "TALLER",
    slug: "taller-autovaloracion",
    shortDescription: "Prácticas para observar el diálogo interno, reconocer recursos personales y entrenar una valoración más consciente.",
    fullDescription: "Taller educativo de desarrollo personal con ejercicios de observación y aprendizaje consciente orientados a la autovaloración.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-autovaloracion-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí se publicarán el acceso, las indicaciones y los materiales del Taller Autovaloración.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/U103890911J",
    checkoutExternalId: "6998704",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 36,
  },
  {
    id: "training-taller-sostener-realidad",
    name: "Taller: Cómo sostener la realidad que quieres",
    acronym: "TALLER",
    slug: "taller-como-sostener-la-realidad-que-quieres",
    shortDescription: "Herramientas de observación y práctica consciente para sostener decisiones, hábitos y acciones alineadas con la realidad que deseas construir.",
    fullDescription: "Taller educativo de desarrollo personal orientado a reconocer patrones, ordenar prioridades y sostener acciones coherentes con objetivos personales.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-como-sostener-la-realidad-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí encontrarás el acceso, las indicaciones y los materiales del taller Cómo sostener la realidad que quieres.",
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "8016551",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 37,
  },
  {
    id: "training-taller-pensar-claridad",
    name: "Taller: Cómo pensar con claridad cuando todo se volvió incierto",
    acronym: "TALLER",
    slug: "taller-como-pensar-con-claridad",
    shortDescription: "Recursos para ordenar la atención, recuperar perspectiva y tomar decisiones con mayor claridad en contextos de incertidumbre.",
    fullDescription: "Taller educativo para observar respuestas automáticas, organizar información y recuperar control sobre las decisiones cuando el contexto se vuelve incierto.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/taller-como-pensar-con-claridad-v3.png",
    resourceUrl: null,
    dashboardContent: "Aquí se habilitarán el acceso, las indicaciones y los materiales del taller Cómo pensar con claridad.",
    checkoutProvider: "HOTMART",
    checkoutUrl: null,
    checkoutExternalId: "8178435",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 38,
  },
  {
    id: "training-transforma-biocomputadora",
    name: "Transforma tu Biocomputadora",
    acronym: "CURSO",
    slug: "transforma-tu-biocomputadora",
    shortDescription: "Una propuesta educativa para comprender patrones mentales, revisar automatismos y entrenar nuevas formas de interpretar y responder.",
    fullDescription: "Curso de Gimnasio del Cerebro orientado a comprender la relación entre aprendizaje, hábitos y respuestas automáticas mediante ejercicios de observación y práctica consciente.",
    logo: "/logos/gdc-full-v2.jpg",
    heroImage: "/images/catalog/covers/transforma-tu-biocomputadora-v3.png",
    resourceUrl: null,
    dashboardContent: "Bienvenida a Transforma tu Biocomputadora. Aquí encontrarás el acceso, las indicaciones y los materiales del curso.",
    checkoutProvider: "HOTMART",
    checkoutUrl: "https://pay.hotmart.com/U101752830I",
    checkoutExternalId: "6196076",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    displayOrder: 39,
  },
];

export const postSeeds: BlogPost[] = [
  {
    id: "post-autodescubrirnos",
    title: "Autodescubrirnos para reconocer quiénes somos",
    slug: "autodescubrirnos-para-reconocer-quienes-somos",
    excerpt: "Una invitación a observarnos con mayor claridad y reconocer los patrones que influyen en nuestra manera de vivir.",
    content: "Autodescubrirnos implica mirar con honestidad nuestras experiencias, decisiones y respuestas. Este espacio editorial conserva el tema original y queda preparado para incorporar el artículo completo desde el administrador.",
    image: null,
    attachmentUrl: null,
    author: null,
    category: "Autoconocimiento",
    publishedAt: "2026-06-12",
    status: "PUBLISHED",
  },
  {
    id: "post-emociones",
    title: "¿Podemos enfermarnos por nuestras emociones negativas?",
    slug: "podemos-enfermarnos-por-nuestras-emociones-negativas",
    excerpt: "Una aproximación responsable al vínculo entre emociones, bienestar y la forma en que interpretamos nuestras experiencias.",
    content: "Este artículo plantea preguntas sobre emociones y bienestar sin reemplazar la evaluación ni la orientación de profesionales de la salud. Su contenido original puede completarse desde el editor del blog.",
    image: null,
    attachmentUrl: null,
    author: null,
    category: "Bienestar",
    publishedAt: "2026-05-28",
    status: "PUBLISHED",
  },
  {
    id: "post-felicidad",
    title: "¿Qué nos impide ser felices?",
    slug: "que-nos-impide-ser-felices",
    excerpt: "Exploramos los bloqueos, hábitos y perspectivas que pueden limitar la forma en que construimos una vida consciente.",
    content: "La felicidad no responde a una única fórmula. Este texto abre un espacio de reflexión sobre aquello que limita nuestras posibilidades y la forma en que podemos observarlo.",
    image: null,
    attachmentUrl: null,
    author: null,
    category: "Desarrollo personal",
    publishedAt: "2026-05-08",
    status: "PUBLISHED",
  },
];

export const testimonialSeeds: Testimonial[] = [
  {
    id: "testimonial-student-nfa",
    name: "Testimonio de una de nuestras estudiantes",
    program: "Neurofitness Active",
    quote: "",
    videoUrl: "https://www.youtube.com/shorts/Cjujway89xA",
    thumbnail: "/images/testimonials/student-nfa.jpg",
    rating: null,
    visible: true,
    displayOrder: 1,
  },
  {
    id: "testimonial-3",
    name: "Testimonio 3",
    program: null,
    quote: "",
    videoUrl: "https://www.youtube.com/shorts/UmwJehaf-ok",
    thumbnail: "/images/testimonials/testimonio-3.jpg",
    rating: null,
    visible: true,
    displayOrder: 2,
  },
  {
    id: "testimonial-4",
    name: "Testimonio 4",
    program: null,
    quote: "",
    videoUrl: "https://www.youtube.com/shorts/4dAdgpQGDNs",
    thumbnail: "/images/testimonials/testimonio-4.jpg",
    rating: null,
    visible: true,
    displayOrder: 3,
  },
  {
    id: "testimonial-saulo-neurotraumas",
    name: "Saulo",
    program: "Neurotraumas",
    quote: "",
    videoUrl: "https://www.youtube.com/shorts/trgHVER5gds",
    thumbnail: "/images/testimonials/saulo-neurotraumas.jpg",
    rating: null,
    visible: true,
    displayOrder: 4,
  },
];

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS trainings (id TEXT PRIMARY KEY, name TEXT NOT NULL, acronym TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT NOT NULL, full_description TEXT NOT NULL DEFAULT '', logo TEXT NOT NULL, hero_image TEXT, resource_url TEXT, dashboard_content TEXT, checkout_provider TEXT NOT NULL DEFAULT 'MANUAL', checkout_url TEXT, checkout_external_id TEXT, price_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'BOB', cta_label TEXT NOT NULL DEFAULT 'Consultar', status TEXT NOT NULL DEFAULT 'PUBLISHED', display_order INTEGER NOT NULL DEFAULT 0, seo_title TEXT, seo_description TEXT, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL, content TEXT NOT NULL, image TEXT, attachment_url TEXT, author TEXT, category TEXT NOT NULL DEFAULT 'Consciencia', status TEXT NOT NULL DEFAULT 'PUBLISHED', published_at TEXT, seo_title TEXT, seo_description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, country TEXT NOT NULL, training_interest TEXT, message TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'website_contact', status TEXT NOT NULL DEFAULT 'NEW', tags TEXT NOT NULL DEFAULT '[]', assignee TEXT, next_follow_up TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_notes (id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, user_id TEXT, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_activities (id TEXT PRIMARY KEY, contact_id TEXT, action TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, name TEXT NOT NULL, program TEXT, quote TEXT, video_url TEXT, thumbnail TEXT, rating INTEGER, visible INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS media_assets (id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS system_secrets (key TEXT PRIMARY KEY, encrypted_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_events (provider_message_id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_auth_credentials (id TEXT PRIMARY KEY, encrypted_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_auth_keys (category TEXT NOT NULL, key_id TEXT NOT NULL, encrypted_value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (category, key_id))`,
  `CREATE TABLE IF NOT EXISTS whatsapp_session_metadata (id TEXT PRIMARY KEY, phone_number TEXT, account_name TEXT, last_connected_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_conversations (id TEXT PRIMARY KEY, jid TEXT NOT NULL UNIQUE, phone_number TEXT NOT NULL, contact_name TEXT NOT NULL DEFAULT 'Contacto', mode TEXT NOT NULL DEFAULT 'AI', product_interest TEXT, last_message TEXT NOT NULL DEFAULT '', last_message_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, unread_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, provider_message_id TEXT UNIQUE, direction TEXT NOT NULL, sender_type TEXT NOT NULL, content TEXT NOT NULL, delivery_status TEXT NOT NULL DEFAULT 'SENT', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, country TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL, training_interest TEXT, appointment_type TEXT NOT NULL DEFAULT 'CONSULTATION', disclaimer_accepted_at TEXT, message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS appointment_blocks (id TEXT PRIMARY KEY, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, appointment_type TEXT NOT NULL DEFAULT 'ALL', recurrence TEXT NOT NULL DEFAULT 'DATE', weekday INTEGER, end_date TEXT, reason TEXT NOT NULL DEFAULT 'Horario no disponible', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL, image TEXT, price_label TEXT NOT NULL DEFAULT 'Consultar', discount_label TEXT, resource_url TEXT, dashboard_content TEXT, checkout_provider TEXT NOT NULL DEFAULT 'MANUAL', checkout_url TEXT, checkout_external_id TEXT, price_cents INTEGER NOT NULL DEFAULT 0, currency TEXT NOT NULL DEFAULT 'BOB', status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS customer_users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, phone TEXT, country TEXT, active INTEGER NOT NULL DEFAULT 1, terms_version TEXT NOT NULL, terms_accepted_at TEXT NOT NULL, privacy_accepted_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, payer_name TEXT NOT NULL, payer_email TEXT, payer_phone TEXT, customer_id TEXT, concept TEXT NOT NULL, item_type TEXT NOT NULL DEFAULT 'OTHER', item_id TEXT, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'BOB', payment_method TEXT NOT NULL DEFAULT 'OTHER', provider_reference TEXT, status TEXT NOT NULL DEFAULT 'PENDING', paid_at TEXT, verified_at TEXT, verified_by TEXT, notes TEXT, source TEXT NOT NULL DEFAULT 'MANUAL', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS payment_webhook_events (id TEXT PRIMARY KEY, provider TEXT NOT NULL, event_id TEXT NOT NULL, event_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PROCESSING', payload_hash TEXT, error TEXT, processed_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS purchase_email_outbox (payment_id TEXT PRIMARY KEY, recipient TEXT NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', attempts INTEGER NOT NULL DEFAULT 0, provider_message_id TEXT, last_error TEXT, sent_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS customer_entitlements (id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, item_type TEXT NOT NULL, item_id TEXT NOT NULL, payment_id TEXT, status TEXT NOT NULL DEFAULT 'ACTIVE', granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS assistant_profiles (id TEXT PRIMARY KEY, item_type TEXT NOT NULL, item_id TEXT NOT NULL, name TEXT NOT NULL, instructions TEXT NOT NULL, model TEXT NOT NULL DEFAULT 'gpt-5.6-luna', enabled INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS assistant_messages (id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, assistant_profile_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS accounting_entries (id TEXT PRIMARY KEY, payment_id TEXT, entry_type TEXT NOT NULL, category TEXT NOT NULL, item_type TEXT NOT NULL DEFAULT 'GENERAL', item_id TEXT, description TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'BOB', occurred_at TEXT NOT NULL, created_by TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL, image TEXT, starts_at TEXT NOT NULL, location TEXT NOT NULL, registration_url TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS associates (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, description TEXT NOT NULL, image TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS neurofitness_attempts (id TEXT PRIMARY KEY, campaign_key TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, token_hash TEXT NOT NULL UNIQUE, seed INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'STARTED', metrics_json TEXT, focus_score INTEGER, control_score INTEGER, memory_score INTEGER, flexibility_score INTEGER, total_score INTEGER, best_domain TEXT, participant_id TEXT, duration_ms INTEGER, started_at TEXT NOT NULL, completed_at TEXT, claimed_at TEXT, whatsapp_delivery_status TEXT NOT NULL DEFAULT 'PENDING', whatsapp_delivery_started_at TEXT, whatsapp_message_id TEXT, whatsapp_delivery_error TEXT, whatsapp_delivered_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS neurofitness_participants (id TEXT PRIMARY KEY, campaign_key TEXT NOT NULL, name TEXT NOT NULL, ranking_alias TEXT, phone TEXT NOT NULL, phone_hash TEXT NOT NULL, best_attempt_id TEXT NOT NULL, result_consent_at TEXT NOT NULL, marketing_consent_at TEXT, ranking_consent_at TEXT, consent_version TEXT NOT NULL DEFAULT 'neurofitness-2026-09', source_event TEXT NOT NULL DEFAULT 'CCM', whatsapp_delivery_status TEXT NOT NULL DEFAULT 'PENDING', whatsapp_attempt_id TEXT, whatsapp_message_id TEXT, whatsapp_delivery_error TEXT, whatsapp_delivered_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_status_created_at ON contacts(status, created_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_auth_keys_unique ON whatsapp_auth_keys(category, key_id)`,
  `CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_updated ON whatsapp_conversations(last_message_at)`,
  `CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_mode ON whatsapp_conversations(mode)`,
  `CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_training_interest ON contacts(training_interest)`,
  `CREATE INDEX IF NOT EXISTS idx_trainings_status_order ON trainings(status, display_order)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_trainings_provider_external_unique ON trainings(checkout_provider, checkout_external_id) WHERE checkout_external_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, preferred_date)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot ON appointments(preferred_date, preferred_time) WHERE status IN ('PENDING', 'CONFIRMED')`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_blocks_date_active ON appointment_blocks(date, active)`,
  `CREATE INDEX IF NOT EXISTS idx_products_status_order ON products(status, display_order)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_products_provider_external_unique ON products(checkout_provider, checkout_external_id) WHERE checkout_external_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON payments(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_payer_email ON payments(payer_email)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_provider_reference ON payments(source, provider_reference)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_source_provider_reference_unique ON payments(source, provider_reference) WHERE provider_reference IS NOT NULL`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_webhook_events_provider_event ON payment_webhook_events(provider, event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_purchase_email_outbox_status_updated ON purchase_email_outbox(status, updated_at)`,
  `CREATE INDEX IF NOT EXISTS idx_customer_users_email_active ON customer_users(email, active)`,
  `CREATE INDEX IF NOT EXISTS idx_customer_entitlements_customer_status ON customer_entitlements(customer_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_customer_entitlements_item ON customer_entitlements(item_type, item_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_entitlements_unique ON customer_entitlements(customer_id, item_type, item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assistant_profiles_item ON assistant_profiles(item_type, item_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_assistant_profiles_item_unique ON assistant_profiles(item_type, item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assistant_messages_customer_profile ON assistant_messages(customer_id, assistant_profile_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_accounting_entries_date_type ON accounting_entries(occurred_at, entry_type)`,
  `CREATE INDEX IF NOT EXISTS idx_accounting_entries_item ON accounting_entries(item_type, item_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, starts_at)`,
  `CREATE INDEX IF NOT EXISTS idx_associates_status_order ON associates(status, display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_neurofitness_attempts_campaign_status ON neurofitness_attempts(campaign_key, status)`,
  `CREATE INDEX IF NOT EXISTS idx_neurofitness_attempts_campaign_score ON neurofitness_attempts(campaign_key, total_score)`,
  `CREATE INDEX IF NOT EXISTS idx_neurofitness_attempts_created_at ON neurofitness_attempts(created_at)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_neurofitness_participants_campaign_phone ON neurofitness_participants(campaign_key, phone_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_neurofitness_participants_best_attempt ON neurofitness_participants(best_attempt_id)`,
  `CREATE INDEX IF NOT EXISTS idx_neurofitness_participants_ranking ON neurofitness_participants(campaign_key, ranking_consent_at)`,
];

const postgresSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS media_blobs (media_id TEXT PRIMARY KEY, body BYTEA NOT NULL)`,
];

const additiveMigrations = [
  `ALTER TABLE trainings ADD COLUMN resource_url TEXT`,
  `ALTER TABLE trainings ADD COLUMN dashboard_content TEXT`,
  `ALTER TABLE trainings ADD COLUMN checkout_provider TEXT NOT NULL DEFAULT 'MANUAL'`,
  `ALTER TABLE trainings ADD COLUMN checkout_url TEXT`,
  `ALTER TABLE trainings ADD COLUMN checkout_external_id TEXT`,
  `ALTER TABLE trainings ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE trainings ADD COLUMN currency TEXT NOT NULL DEFAULT 'BOB'`,
  `ALTER TABLE blog_posts ADD COLUMN attachment_url TEXT`,
  `ALTER TABLE appointments ADD COLUMN appointment_type TEXT NOT NULL DEFAULT 'CONSULTATION'`,
  `ALTER TABLE appointments ADD COLUMN disclaimer_accepted_at TEXT`,
  `ALTER TABLE products ADD COLUMN resource_url TEXT`,
  `ALTER TABLE products ADD COLUMN dashboard_content TEXT`,
  `ALTER TABLE products ADD COLUMN checkout_provider TEXT NOT NULL DEFAULT 'MANUAL'`,
  `ALTER TABLE products ADD COLUMN checkout_url TEXT`,
  `ALTER TABLE products ADD COLUMN checkout_external_id TEXT`,
  `ALTER TABLE products ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE products ADD COLUMN currency TEXT NOT NULL DEFAULT 'BOB'`,
  `ALTER TABLE payments ADD COLUMN customer_id TEXT`,
  `ALTER TABLE appointment_blocks ADD COLUMN recurrence TEXT NOT NULL DEFAULT 'DATE'`,
  `ALTER TABLE appointment_blocks ADD COLUMN weekday INTEGER`,
  `ALTER TABLE appointment_blocks ADD COLUMN end_date TEXT`,
  `ALTER TABLE products ADD COLUMN deleted_at TEXT`,
  `ALTER TABLE events ADD COLUMN deleted_at TEXT`,
  `ALTER TABLE neurofitness_attempts ADD COLUMN whatsapp_delivery_status TEXT NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE neurofitness_attempts ADD COLUMN whatsapp_delivery_started_at TEXT`,
  `ALTER TABLE neurofitness_attempts ADD COLUMN whatsapp_message_id TEXT`,
  `ALTER TABLE neurofitness_attempts ADD COLUMN whatsapp_delivery_error TEXT`,
  `ALTER TABLE neurofitness_attempts ADD COLUMN whatsapp_delivered_at TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_blocks_recurrence_active ON appointment_blocks(recurrence, weekday, active)`,
];

function isExistingColumnError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("duplicate column") || message.includes("already exists");
}

function isNonFatalUniqueIndexError(error: unknown, statement: string) {
  if (!/^\s*CREATE\s+UNIQUE\s+INDEX\b/i.test(statement)) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("duplicate") || message.includes("unique constraint failed") || message.includes("could not create unique index");
}

let ready: Promise<AppDatabase> | null = null;

export function ensureDatabase() {
  if (ready) return ready;
  ready = (async () => {
    const db = await getRuntimeDatabase();
    const statements = db.dialect === "postgres" ? [...schemaStatements, ...postgresSchemaStatements] : schemaStatements;
    const indexStatementPattern = /^\s*CREATE\s+(?:UNIQUE\s+)?INDEX\b/i;
    const tableStatements = statements.filter((statement) => !indexStatementPattern.test(statement));
    const indexStatements = statements.filter((statement) => indexStatementPattern.test(statement));

    // Older installations can be missing columns introduced by the additive
    // migrations below. Create tables first, add those columns, and only then
    // build indexes that reference them.
    for (const statement of tableStatements) {
      try {
        await db.prepare(statement).run();
      } catch (error) {
        // Existing production data can temporarily prevent a new unique index
        // from being built. That index must not take the whole website down.
        if (!isNonFatalUniqueIndexError(error, statement)) throw error;
        console.error("Deferred unique index migration because existing rows conflict.", error);
      }
    }
    for (const statement of additiveMigrations) {
      try {
        await db.prepare(statement).run();
      } catch (error) {
        if (!isExistingColumnError(error)) throw error;
      }
    }
    for (const statement of indexStatements) {
      try {
        await db.prepare(statement).run();
      } catch (error) {
        // Existing production data can temporarily prevent a new unique index
        // from being built. That index must not take the whole website down.
        if (!isNonFatalUniqueIndexError(error, statement)) throw error;
        console.error("Deferred unique index migration because existing rows conflict.", error);
      }
    }
    const adminConfig = await getRuntimeValues(["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_PASSWORD_HASH"]);
    const adminEmail = adminConfig.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
    const configuredHash = adminConfig.ADMIN_PASSWORD_HASH?.trim() ?? "";
    const configuredPassword = adminConfig.ADMIN_PASSWORD?.trim() ?? "";
    const validHash = /^\$2[aby]\$\d{2}\$/.test(configuredHash);
    const passwordHash = configuredPassword
      ? await bcrypt.hash(configuredPassword, 12)
      : validHash
        ? configuredHash
        : configuredHash.length >= 8
          ? await bcrypt.hash(configuredHash, 12)
          : "";
    if (adminEmail && passwordHash) {
      await db.batch([
        db.prepare(`UPDATE users SET password_hash = ?, role = 'SUPERADMIN', active = 1, updated_at = CURRENT_TIMESTAMP WHERE LOWER(email) = ?`)
          .bind(passwordHash, adminEmail),
        db.prepare(`UPDATE users SET email = ?, password_hash = ?, role = 'SUPERADMIN', active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 'bootstrap-superadmin' AND NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = ? AND id <> 'bootstrap-superadmin')`)
          .bind(adminEmail, passwordHash, adminEmail),
        db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, role, active) VALUES ('bootstrap-superadmin', ?, ?, 'SUPERADMIN', 1)`)
          .bind(adminEmail, passwordHash),
      ]);
    }
    const trainingBatch = trainingSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO trainings (id, name, acronym, slug, short_description, full_description, logo, hero_image, resource_url, dashboard_content, checkout_provider, checkout_url, checkout_external_id, price_cents, currency, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.acronym, item.slug, item.shortDescription, item.fullDescription, item.logo, item.heroImage, item.resourceUrl, item.dashboardContent, item.checkoutProvider, item.checkoutUrl, item.checkoutExternalId || null, item.priceCents, item.currency, item.status, item.displayOrder),
    );
    const postBatch = postSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, category, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.title, item.slug, item.excerpt, item.content, item.category, item.status, item.publishedAt),
    );
    const testimonialBatch = testimonialSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO testimonials (id, name, program, quote, video_url, thumbnail, rating, visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.program, item.quote, item.videoUrl, item.thumbnail, item.rating, item.visible ? 1 : 0, item.displayOrder),
    );
    const associateBatch = associateSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO associates (id, name, url, description, image, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.url, item.description, item.image, item.status, item.displayOrder),
    );
    const productBatch = productSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO products (id, name, slug, description, image, price_label, discount_label, resource_url, dashboard_content, checkout_provider, checkout_url, checkout_external_id, price_cents, currency, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.slug, item.description, item.image, item.priceLabel, item.discountLabel, item.resourceUrl, item.dashboardContent, item.checkoutProvider, item.checkoutUrl, item.checkoutExternalId || null, item.priceCents, item.currency, item.status, item.displayOrder),
    );
    const trainingLogoSyncBatch = trainingSeeds.map((item) =>
      db.prepare(`UPDATE trainings SET logo = ?, hero_image = ?, checkout_external_id = COALESCE(checkout_external_id, ?) WHERE id = ?`).bind(item.logo, item.heroImage, item.checkoutExternalId || null, item.id),
    );
    const trainingCheckoutSyncBatch = trainingSeeds
      .filter((item) => item.checkoutProvider === "HOTMART")
      .map((item) =>
        db.prepare(`UPDATE trainings SET checkout_provider = ?, checkout_url = COALESCE(?, checkout_url), checkout_external_id = ?, currency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND (checkout_provider = 'MANUAL' OR checkout_external_id IS NULL OR checkout_external_id IN ('6010207', '6721419'))`)
          .bind(item.checkoutProvider, item.checkoutUrl, item.checkoutExternalId || null, item.currency, item.id),
      );
    const productCheckoutSyncBatch = productSeeds.map((item) =>
      db.prepare(`UPDATE products SET image = ?, checkout_external_id = COALESCE(checkout_external_id, ?) WHERE id = ?`).bind(item.image, item.checkoutExternalId || null, item.id),
    );
    const cap = productSeeds.find((item) => item.id === "product-gdc-cap");
    const featuredProductCopySyncBatch = cap ? [
      db.prepare(`UPDATE products SET name = ?, description = ?, price_label = ?, discount_label = ?, dashboard_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND name IN (?, ?)`)
        .bind(cap.name, cap.description, cap.priceLabel, cap.discountLabel, cap.dashboardContent, cap.id, "Gorro Gimnasio del Cerebro", "Gorro Gimnasio del Cerebro by Kirius"),
      db.prepare(`UPDATE products SET status = 'HIDDEN', updated_at = CURRENT_TIMESTAMP WHERE id = 'product-bioshield-kirius' AND checkout_provider = 'MANUAL' AND checkout_url IS NULL`),
    ] : [];
    const associateImageSyncBatch = associateSeeds.map((item) =>
      db.prepare(`UPDATE associates SET image = ? WHERE id = ?`).bind(item.image, item.id),
    );
    await db.batch([...trainingBatch, ...postBatch, ...testimonialBatch, ...associateBatch, ...productBatch, ...trainingLogoSyncBatch, ...trainingCheckoutSyncBatch, ...productCheckoutSyncBatch, ...featuredProductCopySyncBatch, ...associateImageSyncBatch]);
    return db;
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

export const getDatabase = ensureDatabase;

function mapTraining(row: Record<string, unknown>): Training {
  return {
    id: String(row.id),
    name: String(row.name),
    acronym: String(row.acronym),
    slug: String(row.slug),
    shortDescription: String(row.short_description),
    fullDescription: String(row.full_description),
    logo: String(row.logo),
    heroImage: row.hero_image ? String(row.hero_image) : null,
    resourceUrl: row.resource_url ? String(row.resource_url) : null,
    dashboardContent: row.dashboard_content ? String(row.dashboard_content) : null,
    checkoutProvider: String(row.checkout_provider || "MANUAL") as Training["checkoutProvider"],
    checkoutUrl: row.checkout_url ? String(row.checkout_url) : null,
    checkoutExternalId: row.checkout_external_id ? String(row.checkout_external_id) : null,
    priceCents: Number(row.price_cents || 0),
    currency: String(row.currency || "BOB"),
    status: String(row.status),
    displayOrder: Number(row.display_order),
  };
}

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt),
    content: String(row.content),
    image: row.image ? String(row.image) : null,
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    author: row.author ? String(row.author) : null,
    category: String(row.category),
    publishedAt: row.published_at ? String(row.published_at) : null,
    status: String(row.status),
  };
}

function mapAdminUser(row: Record<string, unknown>): AdminUser {
  return {
    id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    role: String(row.role) as AdminRole,
    active: Boolean(Number(row.active)),
    createdAt: String(row.created_at),
  };
}

function mapTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: String(row.id),
    name: String(row.name),
    program: row.program ? String(row.program) : null,
    quote: String(row.quote ?? ""),
    videoUrl: row.video_url ? String(row.video_url) : "",
    thumbnail: row.thumbnail ? String(row.thumbnail) : "",
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    visible: Boolean(Number(row.visible)),
    displayOrder: Number(row.display_order),
  };
}

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
    country: String(row.country),
    trainingInterest: row.training_interest ? String(row.training_interest) : null,
    message: String(row.message),
    source: String(row.source),
    status: String(row.status),
    nextFollowUp: row.next_follow_up ? String(row.next_follow_up) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: String(row.id), name: String(row.name), email: String(row.email), phone: String(row.phone), country: String(row.country),
    preferredDate: String(row.preferred_date), preferredTime: String(row.preferred_time),
    trainingInterest: row.training_interest ? String(row.training_interest) : null,
    appointmentType: String(row.appointment_type || "CONSULTATION") as Appointment["appointmentType"],
    disclaimerAcceptedAt: row.disclaimer_accepted_at ? String(row.disclaimer_accepted_at) : null,
    message: String(row.message ?? ""), status: String(row.status), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description),
    image: row.image ? String(row.image) : null, priceLabel: String(row.price_label),
    discountLabel: row.discount_label ? String(row.discount_label) : null,
    resourceUrl: row.resource_url ? String(row.resource_url) : null,
    dashboardContent: row.dashboard_content ? String(row.dashboard_content) : null,
    checkoutProvider: String(row.checkout_provider || "MANUAL") as Product["checkoutProvider"],
    checkoutUrl: row.checkout_url ? String(row.checkout_url) : null,
    checkoutExternalId: row.checkout_external_id ? String(row.checkout_external_id) : null,
    priceCents: Number(row.price_cents || 0),
    currency: String(row.currency || "BOB"),
    status: String(row.status), displayOrder: Number(row.display_order),
  };
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id), reference: String(row.reference), payerName: String(row.payer_name),
    payerEmail: row.payer_email ? String(row.payer_email) : null, payerPhone: row.payer_phone ? String(row.payer_phone) : null,
    customerId: row.customer_id ? String(row.customer_id) : null,
    concept: String(row.concept), itemType: String(row.item_type), itemId: row.item_id ? String(row.item_id) : null,
    amountCents: Number(row.amount_cents), currency: String(row.currency), paymentMethod: String(row.payment_method),
    providerReference: row.provider_reference ? String(row.provider_reference) : null, status: String(row.status),
    paidAt: row.paid_at ? String(row.paid_at) : null, verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedBy: row.verified_by ? String(row.verified_by) : null, notes: row.notes ? String(row.notes) : null,
    source: String(row.source), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapEvent(row: Record<string, unknown>): EventItem {
  return {
    id: String(row.id), title: String(row.title), slug: String(row.slug), description: String(row.description),
    image: row.image ? String(row.image) : null, startsAt: String(row.starts_at), location: String(row.location),
    registrationUrl: row.registration_url ? String(row.registration_url) : null, status: String(row.status), displayOrder: Number(row.display_order),
  };
}

function mapAssociate(row: Record<string, unknown>): Associate {
  return {
    id: String(row.id), name: String(row.name), url: String(row.url), description: String(row.description),
    image: row.image ? String(row.image) : null, status: String(row.status), displayOrder: Number(row.display_order),
  };
}

function canUsePublicFallback(error: unknown, includeHidden = false) {
  if (!includeHidden) {
    console.error("Public catalog database read failed; serving the bundled fallback.", error);
    return true;
  }
  return isDatabaseUnavailable(error);
}

export async function getTrainings(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const statement = includeHidden
      ? db.prepare(`SELECT * FROM trainings WHERE deleted_at IS NULL ORDER BY display_order, name`)
      : db.prepare(`SELECT * FROM trainings WHERE status = 'PUBLISHED' AND deleted_at IS NULL ORDER BY display_order, name`);
    const result = await statement.all<Record<string, unknown>>();
    return result.results.map(mapTraining);
  } catch (error) {
    if (canUsePublicFallback(error, includeHidden)) return trainingSeeds.filter((item) => includeHidden || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getTraining(slug: string) {
  try {
    const db = await ensureDatabase();
    const row = await db.prepare(`SELECT * FROM trainings WHERE slug = ? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Record<string, unknown>>();
    return row ? mapTraining(row) : null;
  } catch (error) {
    if (canUsePublicFallback(error)) return trainingSeeds.find((item) => item.slug === slug) ?? null;
    throw error;
  }
}

export async function getPosts(includeDrafts = false) {
  try {
    const db = await ensureDatabase();
    const statement = includeDrafts
      ? db.prepare(`SELECT * FROM blog_posts ORDER BY published_at DESC, created_at DESC`)
      : db.prepare(`SELECT * FROM blog_posts WHERE status = 'PUBLISHED' ORDER BY published_at DESC, created_at DESC`);
    const result = await statement.all<Record<string, unknown>>();
    return result.results.map(mapPost);
  } catch (error) {
    if (canUsePublicFallback(error, includeDrafts)) return postSeeds.filter((item) => includeDrafts || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getPost(slug: string) {
  try {
    const db = await ensureDatabase();
    const row = await db.prepare(`SELECT * FROM blog_posts WHERE slug = ? AND status = 'PUBLISHED' LIMIT 1`).bind(slug).first<Record<string, unknown>>();
    return row ? mapPost(row) : null;
  } catch (error) {
    if (canUsePublicFallback(error)) return postSeeds.find((item) => item.slug === slug && item.status === "PUBLISHED") ?? null;
    throw error;
  }
}

export async function getPostById(id: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM blog_posts WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  return row ? mapPost(row) : null;
}

export async function getTestimonials(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const statement = includeHidden
      ? db.prepare(`SELECT * FROM testimonials ORDER BY display_order, created_at`)
      : db.prepare(`SELECT * FROM testimonials WHERE visible = 1 ORDER BY display_order, created_at`);
    const result = await statement.all<Record<string, unknown>>();
    return result.results.map(mapTestimonial);
  } catch (error) {
    if (canUsePublicFallback(error, includeHidden)) return testimonialSeeds.filter((item) => includeHidden || item.visible);
    throw error;
  }
}

export async function getProducts(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM products WHERE deleted_at IS NULL ORDER BY display_order, name` : `SELECT * FROM products WHERE status = 'PUBLISHED' AND deleted_at IS NULL ORDER BY display_order, name`).all<Record<string, unknown>>();
    return result.results.map(mapProduct);
  } catch (error) {
    if (canUsePublicFallback(error, includeHidden)) return productSeeds.filter((item) => includeHidden || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getProduct(slug: string) {
  try {
    const db = await ensureDatabase();
    const row = await db.prepare(`SELECT * FROM products WHERE slug = ? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Record<string, unknown>>();
    return row ? mapProduct(row) : null;
  } catch (error) {
    if (canUsePublicFallback(error)) return productSeeds.find((item) => item.slug === slug) ?? null;
    throw error;
  }
}

export async function getPayments(query = "", status = "") {
  const db = await ensureDatabase();
  const conditions: string[] = [];
  const bindings: string[] = [];
  if (query) {
    conditions.push(`(payer_name LIKE ? OR payer_email LIKE ? OR payer_phone LIKE ? OR concept LIKE ? OR reference LIKE ? OR provider_reference LIKE ?)`);
    const value = `%${query}%`;
    bindings.push(value, value, value, value, value, value);
  }
  if (status) { conditions.push(`status = ?`); bindings.push(status); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM payments ${where} ORDER BY created_at DESC LIMIT 250`).bind(...bindings).all<Record<string, unknown>>();
  return result.results.map(mapPayment);
}

export type PaymentInput = Pick<Payment, "payerName" | "payerEmail" | "payerPhone" | "concept" | "itemType" | "itemId" | "amountCents" | "currency" | "paymentMethod" | "providerReference" | "paidAt" | "notes"> & { customerId?: string | null; source?: string };

export async function createPayment(input: PaymentInput) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  const reference = `GDC-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 8).toUpperCase()}`;
  let customerId = input.customerId ?? null;
  if (!customerId && input.payerEmail) {
    const customer = await db.prepare(`SELECT id FROM customer_users WHERE email = ? AND active = 1 LIMIT 1`).bind(input.payerEmail.trim().toLowerCase()).first<{ id: string }>();
    customerId = customer?.id ?? null;
  }
  await db.prepare(`INSERT INTO payments (id, reference, payer_name, payer_email, payer_phone, customer_id, concept, item_type, item_id, amount_cents, currency, payment_method, provider_reference, paid_at, notes, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`)
    .bind(id, reference, input.payerName, input.payerEmail, input.payerPhone, customerId, input.concept, input.itemType, input.itemId, input.amountCents, input.currency, input.paymentMethod, input.providerReference, input.paidAt, input.notes, input.source || "MANUAL").run();
  return { id, reference };
}

export async function updatePaymentStatus(id: string, status: string, verifiedBy: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM payments WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  if (!row) throw new Error("Pago no encontrado");
  const payment = mapPayment(row);
  const statements = [db.prepare(`UPDATE payments SET status = ?, verified_at = CASE WHEN ? = 'VERIFIED' THEN CURRENT_TIMESTAMP ELSE verified_at END, verified_by = CASE WHEN ? = 'VERIFIED' THEN ? ELSE verified_by END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(status, status, status, verifiedBy, id)];
  if (status === "VERIFIED") {
    statements.push(db.prepare(`INSERT OR IGNORE INTO accounting_entries (id, payment_id, entry_type, category, item_type, item_id, description, amount_cents, currency, occurred_at, created_by) VALUES (?, ?, 'INCOME', 'Venta verificada', ?, ?, ?, ?, ?, ?, ?)`)
      .bind(`income-${id}`, id, ["PRODUCT", "TRAINING", "EVENT"].includes(payment.itemType) ? payment.itemType : "GENERAL", payment.itemId, payment.concept, payment.amountCents, payment.currency, payment.paidAt || new Date().toISOString(), verifiedBy));
  } else if (status !== "REFUNDED") {
    statements.push(db.prepare(`DELETE FROM accounting_entries WHERE id = ?`).bind(`income-${id}`));
  }
  if (status === "VERIFIED") {
    if (payment.customerId && payment.itemId && ["PRODUCT", "TRAINING"].includes(payment.itemType)) {
      statements.push(db.prepare(`UPDATE customer_entitlements SET status = 'ACTIVE', payment_id = ?, granted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND item_type = ? AND item_id = ?`)
        .bind(id, payment.customerId, payment.itemType, payment.itemId));
      statements.push(db.prepare(`INSERT OR IGNORE INTO customer_entitlements (id, customer_id, item_type, item_id, payment_id, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`)
        .bind(crypto.randomUUID(), payment.customerId, payment.itemType, payment.itemId, id));
    }
  }
  if (status === "REFUNDED") {
    statements.push(db.prepare(`DELETE FROM accounting_entries WHERE payment_id = ? AND category = 'Reembolso parcial'`).bind(id));
    statements.push(db.prepare(`INSERT OR IGNORE INTO accounting_entries (id, payment_id, entry_type, category, item_type, item_id, description, amount_cents, currency, occurred_at, created_by) VALUES (?, ?, 'REFUND', 'Reembolso', ?, ?, ?, ?, ?, ?, ?)`)
      .bind(`refund-${id}`, id, ["PRODUCT", "TRAINING", "EVENT"].includes(payment.itemType) ? payment.itemType : "GENERAL", payment.itemId, `Reembolso · ${payment.concept}`, -Math.abs(payment.amountCents), payment.currency, new Date().toISOString(), verifiedBy));
  } else {
    statements.push(db.prepare(`DELETE FROM accounting_entries WHERE id = ?`).bind(`refund-${id}`));
  }
  if (status !== "VERIFIED") {
    statements.push(db.prepare(`UPDATE customer_entitlements SET status = 'SUSPENDED', updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`).bind(id));
  }
  if (payment.itemType === "OTHER" && payment.itemId && payment.source === "STRIPE" && payment.concept.startsWith("Consulta personalizada")) {
    if (status === "VERIFIED") statements.push(db.prepare(`UPDATE appointments SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(payment.itemId));
    if (["REFUNDED", "REJECTED"].includes(status)) statements.push(db.prepare(`UPDATE appointments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(payment.itemId));
  }
  await db.batch(statements);
}

export type ProviderPaymentEventInput = {
  provider: "STRIPE" | "HOTMART";
  eventId: string;
  eventType: string;
  payloadHash: string;
  localPaymentId?: string | null;
  providerReference?: string | null;
  externalItemId?: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "REFUNDED";
  payerName?: string | null;
  payerEmail?: string | null;
  payerPhone?: string | null;
  amountCents?: number | null;
  refundAmountCents?: number | null;
  refundIsFull?: boolean;
  currency?: string | null;
  paidAt?: string | null;
  eventOccurredAt?: string | null;
  paymentMethod?: string | null;
};

async function upsertPartialRefundAccounting(payment: Payment, cumulativeRefundCents: number, createdBy: string, occurredAt: string) {
  if (payment.amountCents <= 0 || cumulativeRefundCents <= 0 || cumulativeRefundCents >= payment.amountCents) {
    throw new Error("El importe del reembolso parcial no es válido para este pago.");
  }
  const db = await ensureDatabase();
  const id = `partial-refund-${payment.id}`;
  const itemType = ["PRODUCT", "TRAINING", "EVENT"].includes(payment.itemType) ? payment.itemType : "GENERAL";
  const description = `Reembolso parcial acumulado · ${payment.concept}`;
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO accounting_entries (id, payment_id, entry_type, category, item_type, item_id, description, amount_cents, currency, occurred_at, created_by) VALUES (?, ?, 'REFUND', 'Reembolso parcial', ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, payment.id, itemType, payment.itemId, description, -cumulativeRefundCents, payment.currency, occurredAt, createdBy),
    db.prepare(`UPDATE accounting_entries SET amount_cents = CASE WHEN ABS(amount_cents) < ? THEN -? ELSE amount_cents END, occurred_at = CASE WHEN ABS(amount_cents) < ? THEN ? ELSE occurred_at END, description = ?, created_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_id = ? AND entry_type = 'REFUND'`)
      .bind(cumulativeRefundCents, cumulativeRefundCents, cumulativeRefundCents, occurredAt, description, createdBy, id, payment.id),
  ]);
}

async function setWebhookEventState(provider: string, eventId: string, status: "PROCESSING" | "PROCESSED" | "IGNORED" | "FAILED", error: string | null = null) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE payment_webhook_events SET status = ?, error = ?, processed_at = CASE WHEN ? IN ('PROCESSED','IGNORED') THEN CURRENT_TIMESTAMP ELSE processed_at END WHERE provider = ? AND event_id = ?`)
    .bind(status, error, status, provider, eventId).run();
}

async function deliverPurchaseEmail(input: {
  payment: Payment;
  provider: "STRIPE" | "HOTMART";
  recipient: string;
  payerName: string;
  providerReference?: string | null;
  amountCents: number;
  currency: string;
  accountAccess: boolean;
}) {
  const db = await ensureDatabase();
  const confirmation = {
    paymentId: input.payment.id,
    reference: input.payment.reference,
    recipient: input.recipient.trim().toLowerCase(),
    payerName: input.payerName,
    concept: input.payment.concept,
    provider: input.provider,
    providerReference: input.providerReference,
    amountCents: input.amountCents,
    currency: input.currency,
    accountAccess: input.accountAccess,
  };
  const email = buildPurchaseEmail(confirmation);
  await db.prepare(`INSERT OR IGNORE INTO purchase_email_outbox (payment_id, recipient, subject) VALUES (?, ?, ?)`)
    .bind(input.payment.id, confirmation.recipient, email.subject).run();
  const outbox = await db.prepare(`SELECT status, last_error FROM purchase_email_outbox WHERE payment_id = ? LIMIT 1`)
    .bind(input.payment.id).first<{ status: string; last_error: string | null }>();
  if (outbox?.status === "SENT") return { status: "sent" as const, duplicate: true };
  if (outbox?.status === "FAILED" && outbox.last_error?.startsWith("PERMANENT:")) {
    return { status: "failed" as const, reason: outbox.last_error.slice("PERMANENT:".length) };
  }

  try {
    const result = await sendPurchaseConfirmation(confirmation);
    if (result.status === "sent") {
      await db.prepare(`UPDATE purchase_email_outbox SET status = 'SENT', attempts = attempts + 1, provider_message_id = ?, last_error = NULL, sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`)
        .bind(result.messageId, input.payment.id).run();
      return result;
    }
    if (result.status === "skipped") {
      await db.prepare(`UPDATE purchase_email_outbox SET status = 'SKIPPED', last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`)
        .bind(result.reason, input.payment.id).run();
      return result;
    }
    await db.prepare(`UPDATE purchase_email_outbox SET status = 'FAILED', attempts = attempts + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`)
      .bind(`PERMANENT:${result.reason}`, input.payment.id).run();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : `${PURCHASE_EMAIL_RETRYABLE_PREFIX}Error de envío`;
    await db.prepare(`UPDATE purchase_email_outbox SET status = 'FAILED', attempts = attempts + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_id = ?`)
      .bind(message, input.payment.id).run();
    throw error;
  }
}

export async function reconcileProviderPayment(input: ProviderPaymentEventInput) {
  const db = await ensureDatabase();
  const existingEvent = await db.prepare(`SELECT status, error, created_at FROM payment_webhook_events WHERE provider = ? AND event_id = ? LIMIT 1`).bind(input.provider, input.eventId).first<{ status: string; error: string | null; created_at: string }>();
  const eventAgeMs = existingEvent?.created_at ? Date.now() - new Date(existingEvent.created_at.endsWith("Z") ? existingEvent.created_at : `${existingEvent.created_at.replace(" ", "T")}Z`).getTime() : 0;
  const staleProcessing = existingEvent?.status === "PROCESSING" && eventAgeMs > 10 * 60 * 1000;
  if (existingEvent && existingEvent.status !== "FAILED" && !staleProcessing) return { duplicate: true, status: existingEvent.status };
  if (existingEvent?.status === "FAILED" || staleProcessing) {
    await db.prepare(`DELETE FROM payment_webhook_events WHERE provider = ? AND event_id = ? AND status IN ('FAILED', 'PROCESSING')`).bind(input.provider, input.eventId).run();
  }
  try {
    await db.prepare(`INSERT INTO payment_webhook_events (id, provider, event_id, event_type, status, payload_hash) VALUES (?, ?, ?, ?, 'PROCESSING', ?)`)
      .bind(`${input.provider}:${input.eventId}`, input.provider, input.eventId, input.eventType, input.payloadHash).run();
  } catch {
    const claimed = await db.prepare(`SELECT status FROM payment_webhook_events WHERE provider = ? AND event_id = ? LIMIT 1`).bind(input.provider, input.eventId).first<{ status: string }>();
    return { duplicate: true, status: claimed?.status || "PROCESSING" };
  }

  try {
    let row = input.localPaymentId
      ? await db.prepare(`SELECT * FROM payments WHERE id = ? LIMIT 1`).bind(input.localPaymentId).first<Record<string, unknown>>()
      : null;
    if (!row && input.providerReference) {
      row = await db.prepare(`SELECT * FROM payments WHERE source = ? AND provider_reference = ? ORDER BY created_at DESC LIMIT 1`)
        .bind(input.provider, input.providerReference).first<Record<string, unknown>>();
    }

    let item: { id: string; name: string; item_type: "PRODUCT" | "TRAINING" } | null = null;
    if (!row && input.externalItemId) {
      item = await db.prepare(`SELECT id, name, 'PRODUCT' AS item_type FROM products WHERE checkout_provider = ? AND checkout_external_id = ? AND deleted_at IS NULL UNION ALL SELECT id, name, 'TRAINING' AS item_type FROM trainings WHERE checkout_provider = ? AND checkout_external_id = ? AND deleted_at IS NULL LIMIT 1`)
        .bind(input.provider, input.externalItemId, input.provider, input.externalItemId).first<{ id: string; name: string; item_type: "PRODUCT" | "TRAINING" }>();
    }

    if (!row && item) {
      const customer = input.payerEmail
        ? await db.prepare(`SELECT id FROM customer_users WHERE email = ? AND active = 1 LIMIT 1`).bind(input.payerEmail.trim().toLowerCase()).first<{ id: string }>()
        : null;
      const created = await createPayment({
        payerName: input.payerName || "Comprador",
        payerEmail: input.payerEmail || null,
        payerPhone: input.payerPhone || null,
        customerId: customer?.id || null,
        concept: item.name,
        itemType: item.item_type,
        itemId: item.id,
        amountCents: Math.max(0, input.amountCents || 0),
        currency: (input.currency || "USD").toUpperCase(),
        paymentMethod: input.paymentMethod || "CARD",
        providerReference: input.providerReference || null,
        paidAt: input.paidAt || null,
        notes: `Registrado automáticamente desde ${input.provider}.`,
        source: input.provider,
      });
      row = await db.prepare(`SELECT * FROM payments WHERE id = ? LIMIT 1`).bind(created.id).first<Record<string, unknown>>();
    }

    if (!row) {
      await setWebhookEventState(input.provider, input.eventId, "IGNORED", "No se encontró un intento de pago o artículo local asociado.");
      return { ignored: true };
    }

    const payment = mapPayment(row);
    if (payment.source !== input.provider) throw new Error("El proveedor del evento no coincide con el intento de pago.");
    if (payment.status === "REFUNDED" && input.status !== "REFUNDED") {
      await setWebhookEventState(input.provider, input.eventId, "IGNORED", "El pago ya está reembolsado; no se aplicó un estado anterior.");
      return { ignored: true, paymentId: payment.id, status: payment.status };
    }
    if (payment.status === "VERIFIED" && ["PENDING", "REJECTED"].includes(input.status)) {
      await setWebhookEventState(input.provider, input.eventId, "IGNORED", "El pago ya está verificado; no se aplicó un estado anterior.");
      return { ignored: true, paymentId: payment.id, status: payment.status };
    }
    const eventAmount = input.amountCents == null ? payment.amountCents : Math.max(0, Math.round(input.amountCents));
    const eventCurrency = (input.currency || payment.currency).toUpperCase();
    const refundAmount = input.refundAmountCents == null ? null : Math.max(0, Math.round(input.refundAmountCents));
    const isPartialRefund = refundAmount != null && !input.refundIsFull;
    if (input.refundIsFull && input.status !== "REFUNDED") throw new Error("Un reembolso total debe cerrar el pago como reembolsado.");
    if (isPartialRefund && input.status !== "VERIFIED") throw new Error("Un reembolso parcial debe conservar el pago verificado.");
    if (isPartialRefund && (refundAmount <= 0 || eventAmount <= 0 || refundAmount >= eventAmount)) throw new Error("El importe del reembolso parcial no es válido para este pago.");
    if (input.refundIsFull && refundAmount != null && eventAmount > 0 && refundAmount !== eventAmount) throw new Error("El importe del reembolso total no coincide con el pago.");
    if (input.status === "VERIFIED" && eventAmount <= 0) throw new Error("El proveedor no informó un importe válido para un pago aprobado.");
    if (payment.amountCents > 0 && eventAmount > 0 && payment.amountCents !== eventAmount) throw new Error("El importe recibido no coincide con el importe configurado.");
    if (payment.amountCents > 0 && payment.currency && eventCurrency !== payment.currency.toUpperCase()) throw new Error("La moneda recibida no coincide con la moneda configurada.");
    const customer = !payment.customerId && input.payerEmail
      ? await db.prepare(`SELECT id FROM customer_users WHERE email = ? AND active = 1 LIMIT 1`).bind(input.payerEmail.trim().toLowerCase()).first<{ id: string }>()
      : null;

    await db.prepare(`UPDATE payments SET payer_name = ?, payer_email = ?, payer_phone = ?, customer_id = COALESCE(customer_id, ?), amount_cents = ?, currency = ?, payment_method = ?, provider_reference = COALESCE(?, provider_reference), paid_at = COALESCE(?, paid_at), notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(input.payerName || payment.payerName, input.payerEmail || payment.payerEmail, input.payerPhone || payment.payerPhone, customer?.id || null, eventAmount, eventCurrency, input.paymentMethod || payment.paymentMethod, input.providerReference || null, input.paidAt || null, `Sincronizado automáticamente por ${input.provider} (${input.eventType}).`, payment.id).run();
    if (input.status !== "PENDING") await updatePaymentStatus(payment.id, input.status, `${input.provider} automático`);
    if (isPartialRefund && refundAmount != null) {
      await upsertPartialRefundAccounting(
        { ...payment, amountCents: eventAmount, currency: eventCurrency },
        refundAmount,
        `${input.provider} automático`,
        input.eventOccurredAt || new Date().toISOString(),
      );
    }
    const recipient = (input.payerEmail || payment.payerEmail || "").trim();
    const email = input.status === "VERIFIED" && !isPartialRefund && recipient
      ? await deliverPurchaseEmail({
        payment,
        provider: input.provider,
        recipient,
        payerName: input.payerName || payment.payerName,
        providerReference: input.providerReference || payment.providerReference,
        amountCents: eventAmount,
        currency: eventCurrency,
        accountAccess: Boolean(payment.customerId || customer?.id),
      })
      : null;
    await setWebhookEventState(input.provider, input.eventId, "PROCESSED");
    return { paymentId: payment.id, status: input.status, partialRefundCents: isPartialRefund ? refundAmount : null, email };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de conciliación";
    await setWebhookEventState(input.provider, input.eventId, "FAILED", message);
    throw error;
  }
}

export async function getPaymentSummary() {
  const db = await ensureDatabase();
  const [pending, verified, rejected, totals] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM payments WHERE status = 'PENDING'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM payments WHERE status = 'VERIFIED'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM payments WHERE status IN ('REJECTED', 'REFUNDED')`).first<{ count: number }>(),
    db.prepare(`SELECT currency, COALESCE(SUM(amount_cents), 0) AS amount_cents FROM payments WHERE status = 'VERIFIED' GROUP BY currency ORDER BY currency`).all<{ currency: string; amount_cents: number }>(),
  ]);
  return { pending: Number(pending?.count ?? 0), verified: Number(verified?.count ?? 0), exceptions: Number(rejected?.count ?? 0), totals: totals.results.map((row) => ({ currency: row.currency, amountCents: Number(row.amount_cents) })) };
}

export async function getEvents(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM events WHERE deleted_at IS NULL ORDER BY starts_at, display_order` : `SELECT * FROM events WHERE status = 'PUBLISHED' AND deleted_at IS NULL ORDER BY starts_at, display_order`).all<Record<string, unknown>>();
    return result.results.map(mapEvent);
  } catch (error) {
    if (canUsePublicFallback(error, includeHidden)) return [];
    throw error;
  }
}

export async function getAssociates(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM associates ORDER BY display_order, name` : `SELECT * FROM associates WHERE status = 'PUBLISHED' ORDER BY display_order, name`).all<Record<string, unknown>>();
    return result.results.map(mapAssociate);
  } catch (error) {
    if (canUsePublicFallback(error, includeHidden)) return associateSeeds.filter((item) => includeHidden || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getPublicNotifications(): Promise<PublicNotification[]> {
  const [events, products] = await Promise.all([getEvents(), getProducts()]);
  const eventItems = events.slice(0, 4).map((item) => ({
    id: `event-${item.id}`, title: item.title,
    detail: `${new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short" }).format(new Date(item.startsAt))} · ${item.location}`,
    href: "/eventos", kind: "event" as const,
  }));
  const discounts = products.filter((item) => item.discountLabel).slice(0, 3).map((item) => ({
    id: `discount-${item.id}`, title: item.name, detail: item.discountLabel || "Novedad disponible", href: "/productos", kind: "discount" as const,
  }));
  return [...eventItems, ...discounts].slice(0, 6);
}

export async function getAppointments() {
  const db = await ensureDatabase();
  const result = await db.prepare(`SELECT * FROM appointments ORDER BY CASE status WHEN 'PENDING' THEN 0 WHEN 'CONFIRMED' THEN 1 ELSE 2 END, preferred_date, preferred_time`).all<Record<string, unknown>>();
  return result.results.map(mapAppointment);
}

export class AppointmentUnavailableError extends Error {}

export async function createAppointment(input: Omit<Appointment, "id" | "status" | "createdAt" | "updatedAt">) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  const weekday = new Date(`${input.preferredDate}T12:00:00Z`).getUTCDay();
  const blocked = await db.prepare(`SELECT id FROM appointment_blocks WHERE active = 1 AND (appointment_type = 'ALL' OR appointment_type = ?) AND start_time <= ? AND end_time > ? AND ((recurrence = 'DATE' AND date = ?) OR (recurrence = 'WEEKLY' AND weekday = ? AND date <= ? AND (end_date IS NULL OR end_date = '' OR end_date >= ?))) LIMIT 1`)
    .bind(input.appointmentType, input.preferredTime, input.preferredTime, input.preferredDate, weekday, input.preferredDate, input.preferredDate).first<{ id: string }>();
  const occupied = await db.prepare(`SELECT id FROM appointments WHERE preferred_date = ? AND preferred_time = ? AND status IN ('PENDING', 'CONFIRMED') LIMIT 1`)
    .bind(input.preferredDate, input.preferredTime).first<{ id: string }>();
  if (blocked || occupied) throw new AppointmentUnavailableError("Horario no disponible");
  try {
    await db.prepare(`INSERT INTO appointments (id, name, email, phone, country, preferred_date, preferred_time, training_interest, appointment_type, disclaimer_accepted_at, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`)
      .bind(id, input.name, input.email, input.phone, input.country, input.preferredDate, input.preferredTime, input.trainingInterest, input.appointmentType, input.disclaimerAcceptedAt, input.message).run();
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes("unique") || message.includes("constraint")) throw new AppointmentUnavailableError("Horario no disponible");
    throw error;
  }
  return id;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, id).run();
}

export type ProductInput = Omit<Product, "id" | "status">;
export type EventInput = Omit<EventItem, "id" | "status">;
export type AssociateInput = Omit<Associate, "id" | "status">;

export async function createProduct(input: ProductInput) {
  const db = await ensureDatabase(); const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO products (id, name, slug, description, image, price_label, discount_label, resource_url, dashboard_content, checkout_provider, checkout_url, checkout_external_id, price_cents, currency, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.name, input.slug, input.description, input.image, input.priceLabel, input.discountLabel, input.resourceUrl, input.dashboardContent, input.checkoutProvider, input.checkoutUrl, input.checkoutExternalId || null, input.priceCents, input.currency, input.displayOrder).run(); return id;
}

export async function updateProduct(id: string, input: ProductInput) {
  const db = await ensureDatabase(); await db.prepare(`UPDATE products SET name = ?, slug = ?, description = ?, image = ?, price_label = ?, discount_label = ?, resource_url = ?, dashboard_content = ?, checkout_provider = ?, checkout_url = ?, checkout_external_id = ?, price_cents = ?, currency = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.slug, input.description, input.image, input.priceLabel, input.discountLabel, input.resourceUrl, input.dashboardContent, input.checkoutProvider, input.checkoutUrl, input.checkoutExternalId || null, input.priceCents, input.currency, input.displayOrder, id).run();
}

export async function createEvent(input: EventInput) {
  const db = await ensureDatabase(); const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO events (id, title, slug, description, image, starts_at, location, registration_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.title, input.slug, input.description, input.image, input.startsAt, input.location, input.registrationUrl, input.displayOrder).run(); return id;
}

export async function updateEvent(id: string, input: EventInput) {
  const db = await ensureDatabase(); await db.prepare(`UPDATE events SET title = ?, slug = ?, description = ?, image = ?, starts_at = ?, location = ?, registration_url = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.title, input.slug, input.description, input.image, input.startsAt, input.location, input.registrationUrl, input.displayOrder, id).run();
}

export async function createAssociate(input: AssociateInput) {
  const db = await ensureDatabase(); const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO associates (id, name, url, description, image, status, display_order) VALUES (?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.name, input.url, input.description, input.image, input.displayOrder).run(); return id;
}

export async function updateAssociate(id: string, input: AssociateInput) {
  const db = await ensureDatabase(); await db.prepare(`UPDATE associates SET name = ?, url = ?, description = ?, image = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.url, input.description, input.image, input.displayOrder, id).run();
}

export async function setCatalogStatus(table: "products" | "events" | "associates", id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE ${table} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, id).run();
}

export async function softDeleteCatalogItem(table: "products" | "events", id: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE ${table} SET status = 'HIDDEN', deleted_at = CURRENT_TIMESTAMP, slug = slug || '-deleted-' || substr(id, 1, 8), updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`).bind(id).run();
}

export async function createContact(input: Omit<Contact, "id" | "status" | "source" | "createdAt" | "updatedAt" | "nextFollowUp">) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.batch([
    db.prepare(`INSERT INTO contacts (id, name, email, phone, country, training_interest, message, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'website_contact', 'NEW')`)
      .bind(id, input.name, input.email, input.phone, input.country, input.trainingInterest, input.message),
    db.prepare(`INSERT INTO contact_activities (id, contact_id, action, metadata) VALUES (?, ?, 'contact_created', ?)`)
      .bind(crypto.randomUUID(), id, JSON.stringify({ source: "website_contact" })),
  ]);
  return id;
}

export async function getContacts(query = "", status = "") {
  const db = await ensureDatabase();
  const conditions: string[] = [];
  const bindings: string[] = [];
  if (query) {
    conditions.push(`(name LIKE ? OR email LIKE ? OR phone LIKE ?)`);
    const value = `%${query}%`;
    bindings.push(value, value, value);
  }
  if (status) {
    conditions.push(`status = ?`);
    bindings.push(status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.prepare(`SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT 100`).bind(...bindings).all<Record<string, unknown>>();
  return result.results.map(mapContact);
}

export async function getContact(id: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM contacts WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  if (!row) return null;
  const notes = await db.prepare(`SELECT * FROM contact_notes WHERE contact_id = ? ORDER BY created_at DESC`).bind(id).all<Record<string, unknown>>();
  const activities = await db.prepare(`SELECT * FROM contact_activities WHERE contact_id = ? ORDER BY created_at DESC`).bind(id).all<Record<string, unknown>>();
  return { contact: mapContact(row), notes: notes.results, activities: activities.results };
}

export async function updateContact(id: string, status: string, nextFollowUp?: string | null, note?: string) {
  const db = await ensureDatabase();
  const statements = [
    db.prepare(`UPDATE contacts SET status = ?, next_follow_up = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, nextFollowUp ?? null, id),
    db.prepare(`INSERT INTO contact_activities (id, contact_id, action, metadata) VALUES (?, ?, 'status_changed', ?)`).bind(crypto.randomUUID(), id, JSON.stringify({ status })),
  ];
  if (note?.trim()) {
    statements.push(db.prepare(`INSERT INTO contact_notes (id, contact_id, body) VALUES (?, ?, ?)`).bind(crypto.randomUUID(), id, note.trim()));
  }
  await db.batch(statements);
}

export async function getDashboardData() {
  const db = await ensureDatabase();
  const [contactsResult, newResult, appointmentsResult, paymentsResult, trainingsResult, postsResult, productsResult, eventsResult, recentResult, activityResult] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM contacts`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM contacts WHERE status = 'NEW'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM appointments WHERE status IN ('PENDING', 'CONFIRMED')`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM payments WHERE status = 'PENDING'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM trainings WHERE status = 'PUBLISHED' AND deleted_at IS NULL`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM blog_posts WHERE status = 'PUBLISHED'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM products WHERE status = 'PUBLISHED' AND deleted_at IS NULL`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM events WHERE status = 'PUBLISHED' AND deleted_at IS NULL`).first<{ count: number }>(),
    db.prepare(`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
    db.prepare(`SELECT * FROM contact_activities ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
  ]);
  return {
    counts: { contacts: Number(contactsResult?.count ?? 0), newContacts: Number(newResult?.count ?? 0), appointments: Number(appointmentsResult?.count ?? 0), pendingPayments: Number(paymentsResult?.count ?? 0), trainings: Number(trainingsResult?.count ?? 0), posts: Number(postsResult?.count ?? 0), products: Number(productsResult?.count ?? 0), events: Number(eventsResult?.count ?? 0) },
    recent: recentResult.results.map(mapContact),
    activity: activityResult.results,
  };
}

export type TrainingInput = { name: string; acronym: string; slug: string; shortDescription: string; fullDescription: string; logo: string; heroImage?: string | null; resourceUrl?: string | null; dashboardContent?: string | null; checkoutProvider: "STRIPE" | "HOTMART" | "MANUAL"; checkoutUrl?: string | null; checkoutExternalId?: string | null; priceCents: number; currency: string; displayOrder: number };

export async function createTraining(input: TrainingInput) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  const result = await db.prepare(`SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM trainings`).first<{ next_order: number }>();
  await db.prepare(`INSERT INTO trainings (id, name, acronym, slug, short_description, full_description, logo, hero_image, resource_url, dashboard_content, checkout_provider, checkout_url, checkout_external_id, price_cents, currency, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.name, input.acronym, input.slug, input.shortDescription, input.fullDescription, input.logo, input.heroImage ?? null, input.resourceUrl ?? null, input.dashboardContent ?? null, input.checkoutProvider, input.checkoutUrl ?? null, input.checkoutExternalId ?? null, input.priceCents, input.currency, input.displayOrder || result?.next_order || 1).run();
  return id;
}

export async function updateTraining(id: string, input: TrainingInput) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE trainings SET name = ?, acronym = ?, slug = ?, short_description = ?, full_description = ?, logo = ?, hero_image = ?, resource_url = ?, dashboard_content = ?, checkout_provider = ?, checkout_url = ?, checkout_external_id = ?, price_cents = ?, currency = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.acronym, input.slug, input.shortDescription, input.fullDescription, input.logo, input.heroImage ?? null, input.resourceUrl ?? null, input.dashboardContent ?? null, input.checkoutProvider, input.checkoutUrl ?? null, input.checkoutExternalId ?? null, input.priceCents, input.currency, input.displayOrder, id).run();
}

export async function setTrainingStatus(id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE trainings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, id).run();
}

export type PostInput = { title: string; slug: string; excerpt: string; content: string; category: string; image?: string | null; attachmentUrl?: string | null; author?: string | null };

export async function createPost(input: PostInput) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO blog_posts (id, title, slug, excerpt, content, image, attachment_url, author, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`)
    .bind(id, input.title, input.slug, input.excerpt, input.content, input.image ?? null, input.attachmentUrl ?? null, input.author ?? null, input.category).run();
  return id;
}

export async function updatePost(id: string, input: PostInput) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, attachment_url = ?, author = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.title, input.slug, input.excerpt, input.content, input.image ?? null, input.attachmentUrl ?? null, input.author ?? null, input.category, id).run();
}

export type TestimonialInput = { name: string; program?: string | null; quote?: string | null; videoUrl?: string | null; thumbnail?: string | null; rating?: number | null; visible: boolean; displayOrder: number };

export async function createTestimonial(input: TestimonialInput) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO testimonials (id, name, program, quote, video_url, thumbnail, rating, visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, input.name, input.program ?? null, input.quote ?? null, input.videoUrl ?? null, input.thumbnail ?? null, input.rating ?? null, input.visible ? 1 : 0, input.displayOrder).run();
  return id;
}

export async function updateTestimonial(id: string, input: TestimonialInput) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE testimonials SET name = ?, program = ?, quote = ?, video_url = ?, thumbnail = ?, rating = ?, visible = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.program ?? null, input.quote ?? null, input.videoUrl ?? null, input.thumbnail ?? null, input.rating ?? null, input.visible ? 1 : 0, input.displayOrder, id).run();
}

export async function setPostStatus(id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE blog_posts SET status = ?, published_at = CASE WHEN ? = 'PUBLISHED' THEN COALESCE(published_at, date('now')) ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, status, id).run();
}

export async function getAdminUserByEmail(email: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM users WHERE email = ? LIMIT 1`).bind(email.trim().toLowerCase()).first<Record<string, unknown>>();
  return row ? mapAdminUser(row) : null;
}

export async function getAdminUserById(id: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM users WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  return row ? mapAdminUser(row) : null;
}

export async function getAdminUsers() {
  const db = await ensureDatabase();
  const result = await db.prepare(`SELECT * FROM users ORDER BY CASE role WHEN 'SUPERADMIN' THEN 0 WHEN 'EDITOR' THEN 1 ELSE 2 END, email`).all<Record<string, unknown>>();
  return result.results.map(mapAdminUser);
}

export async function createAdminUser(input: { email: string; passwordHash: string; role: AdminRole }) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO users (id, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)`)
    .bind(id, input.email.trim().toLowerCase(), input.passwordHash, input.role).run();
  return id;
}

export async function updateAdminUser(id: string, input: { role: AdminRole; active: boolean; passwordHash?: string }) {
  const db = await ensureDatabase();
  if (input.passwordHash) {
    await db.prepare(`UPDATE users SET role = ?, active = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(input.role, input.active ? 1 : 0, input.passwordHash, id).run();
    return;
  }
  await db.prepare(`UPDATE users SET role = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.role, input.active ? 1 : 0, id).run();
}

export async function countActiveSuperadmins() {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT COUNT(*) AS count FROM users WHERE role = 'SUPERADMIN' AND active = 1`).first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export const defaultSettings: Record<string, string> = {
  siteName: "Gimnasio del Cerebro",
  whatsapp: "543813004167",
  contactEmail: "",
  heroEyebrow: "Neurociencia aplicada · consciencia · transformación",
  heroTitle: "Comprende tu mente. Amplía tus posibilidades.",
  heroDescription: "Entrenamientos que integran neurociencia, aprendizaje consciente y una perspectiva conceptual inspirada en la física cuántica para convertir conocimiento en práctica.",
  ctaTitle: "El cambio comienza cuando comprendes cómo funciona tu mente.",
  ctaDescription: "Descubre el entrenamiento que mejor se adapta a tu momento actual.",
  instagram: "",
  facebook: "",
  youtube: "",
  openAiDefaultModel: "gpt-5.6-luna",
  whatsappAiEnabled: "false",
  whatsappAiModel: "gpt-5.6-luna",
  whatsappAiInstructions: "Responde en español de forma clara, cercana y breve como asistente de Gimnasio del Cerebro. Orienta sobre los entrenamientos sin inventar precios, certificaciones, resultados ni afirmaciones médicas. Si la consulta requiere decisión humana, pide los datos de contacto y avisa que un asesor continuará.",
  whatsappAiGreeting: "¡Hola! Soy el asistente automático de Gimnasio del Cerebro. ¿Qué producto, programa, curso, neuroreto o taller te interesa? 😊",
  whatsappAiHandoffMessage: "Gracias por contármelo. Voy a dejar esta conversación en atención humana para que una persona del equipo pueda ayudarte con cuidado.",
  whatsappAiResponseDelayMs: "900",
  whatsappAiBusinessHours: "Atención humana según disponibilidad del equipo. La IA puede orientar en cualquier momento.",
  whatsappCurrentCampaignSlug: "super-cerebro-master-class",
  whatsappCatalogPath: "/entrenamientos",
  neurofitnessEnabled: "true",
  neurofitnessCampaignKey: "ccm-2026",
  neurofitnessPopupFrequency: "session",
  neurofitnessPopupDelayMs: "1400",
  neurofitnessPopupEyebrow: "Juego del evento",
  neurofitnessPopupTitle: "Reto Neurofitness",
  neurofitnessPopupDescription: "¿Qué tan entrenado está tu cerebro? 60 segundos · 4 desafíos · 1 resultado.",
  neurofitnessPopupCta: "Iniciar reto",
  neurofitnessEventLabel: "Conferencia especial · CCM",
  neurofitnessRankingLabel: "NEUROFITNESS LIVE · CCM",
  neurofitnessRewardLabel: "",
  neurofitnessRewardUrl: "",
};

export async function getSettings() {
  try {
    const db = await ensureDatabase();
    const runtime = await getRuntimeValues(["WHATSAPP_NUMBER"]);
    const initialSettings = { ...defaultSettings, whatsapp: runtime.WHATSAPP_NUMBER?.trim() || defaultSettings.whatsapp };
    const inserts = Object.entries(initialSettings).map(([key, value]) => db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`).bind(key, value));
    const legacySettingMigrations = [
      ["heroEyebrow", "Conocimiento que se convierte en acción", defaultSettings.heroEyebrow],
      ["heroTitle", "Entrena tu cerebro. Transforma tu vida.", defaultSettings.heroTitle],
      ["heroDescription", "Más de una década acompañando a personas en el desarrollo de una vida más consciente.", defaultSettings.heroDescription],
      ["whatsappAiGreeting", "¡Hola! 😊 Soy el asistente de Gimnasio del Cerebro. Cuéntame qué te gustaría mejorar o sobre qué entrenamiento deseas información.", defaultSettings.whatsappAiGreeting],
    ].map(([key, oldValue, newValue]) => db.prepare(`UPDATE site_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND value = ?`).bind(newValue, key, oldValue));
    await db.batch([...inserts, ...legacySettingMigrations]);
    const result = await db.prepare(`SELECT key, value FROM site_settings`).all<{ key: string; value: string }>();
    return Object.fromEntries(result.results.map((row) => [row.key, row.value]));
  } catch (error) {
    if (canUsePublicFallback(error)) {
      const runtime = await getRuntimeValues(["WHATSAPP_NUMBER"]);
      return { ...defaultSettings, whatsapp: runtime.WHATSAPP_NUMBER?.trim() || defaultSettings.whatsapp };
    }
    throw error;
  }
}

export async function getSettingsReadOnly() {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(`SELECT key, value FROM site_settings`).all<{ key: string; value: string }>();
    return { ...defaultSettings, ...Object.fromEntries(result.results.map((row) => [row.key, row.value])) };
  } catch (error) {
    if (canUsePublicFallback(error)) return { ...defaultSettings };
    throw error;
  }
}

export async function updateSettings(values: Record<string, string>) {
  const db = await ensureDatabase();
  const allowed = Object.keys(defaultSettings);
  const entries = Object.entries(values).filter(([key]) => allowed.includes(key));
  if (!entries.length) return;
  await db.batch(entries.map(([key, value]) => db.prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).bind(key, value)));
}

export async function saveMedia(input: { id: string; name: string; key: string; mimeType: string; size: number; body?: Uint8Array }) {
  const db = await ensureDatabase();
  const statements = [
    db.prepare(`INSERT INTO media_assets (id, name, key, mime_type, size) VALUES (?, ?, ?, ?, ?)`).bind(input.id, input.name, input.key, input.mimeType, input.size),
  ];
  if (db.dialect === "postgres" && input.body) {
    statements.push(db.prepare(`INSERT INTO media_blobs (media_id, body) VALUES (?, ?)`).bind(input.id, input.body));
  }
  await db.batch(statements);
}

export async function getMedia(id: string) {
  const db = await ensureDatabase();
  if (db.dialect === "postgres") {
    return db.prepare(`SELECT a.id, a.key, a.mime_type, a.size, b.body FROM media_assets a JOIN media_blobs b ON b.media_id = a.id WHERE a.id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  }
  return db.prepare(`SELECT id, key, mime_type, size FROM media_assets WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
}

export async function claimWhatsAppEvent(providerMessageId: string) {
  const db = await ensureDatabase();
  try {
    await db.prepare(`INSERT INTO whatsapp_events (provider_message_id) VALUES (?)`).bind(providerMessageId).run();
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (message.includes("unique") || message.includes("duplicate")) return false;
    throw error;
  }
}

export async function releaseWhatsAppEvent(providerMessageId: string) {
  const db = await ensureDatabase();
  await db.prepare(`DELETE FROM whatsapp_events WHERE provider_message_id = ?`).bind(providerMessageId).run();
}

function mapWhatsAppConversation(row: Record<string, unknown>): WhatsAppConversation {
  return {
    id: String(row.id),
    jid: String(row.jid),
    phoneNumber: String(row.phone_number),
    contactName: String(row.contact_name || "Contacto"),
    mode: String(row.mode || "AI") as WhatsAppConversation["mode"],
    productInterest: row.product_interest ? String(row.product_interest) : null,
    lastMessage: String(row.last_message || ""),
    lastMessageAt: String(row.last_message_at),
    unreadCount: Number(row.unread_count || 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapWhatsAppMessage(row: Record<string, unknown>): WhatsAppMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    providerMessageId: row.provider_message_id ? String(row.provider_message_id) : null,
    direction: String(row.direction) as WhatsAppMessage["direction"],
    senderType: String(row.sender_type) as WhatsAppMessage["senderType"],
    content: String(row.content),
    deliveryStatus: String(row.delivery_status || "SENT"),
    createdAt: String(row.created_at),
  };
}

export async function getWhatsAppConversations(limit = 100) {
  const db = await ensureDatabase();
  const result = await db.prepare(`SELECT * FROM whatsapp_conversations ORDER BY last_message_at DESC LIMIT ?`).bind(Math.min(Math.max(limit, 1), 250)).all<Record<string, unknown>>();
  return result.results.map(mapWhatsAppConversation);
}

export async function getWhatsAppConversation(id: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM whatsapp_conversations WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  return row ? mapWhatsAppConversation(row) : null;
}

export async function getWhatsAppConversationByJid(jid: string) {
  const db = await ensureDatabase();
  const row = await db.prepare(`SELECT * FROM whatsapp_conversations WHERE jid = ? LIMIT 1`).bind(jid).first<Record<string, unknown>>();
  return row ? mapWhatsAppConversation(row) : null;
}

export async function getWhatsAppMessages(conversationId: string, limit = 80) {
  const db = await ensureDatabase();
  const result = await db.prepare(`SELECT * FROM whatsapp_messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?`).bind(conversationId, Math.min(Math.max(limit, 1), 200)).all<Record<string, unknown>>();
  return result.results.reverse().map(mapWhatsAppMessage);
}

export async function recordWhatsAppIncoming(input: { jid: string; phoneNumber: string; contactName?: string | null; providerMessageId: string; content: string; receivedAt?: string | null }) {
  const db = await ensureDatabase();
  const existing = await db.prepare(`SELECT id FROM whatsapp_conversations WHERE jid = ? LIMIT 1`).bind(input.jid).first<{ id: string }>();
  const conversationId = existing?.id || crypto.randomUUID();
  const receivedAt = input.receivedAt || new Date().toISOString();
  if (!existing) {
    await db.prepare(`INSERT INTO whatsapp_conversations (id, jid, phone_number, contact_name, mode, last_message, last_message_at, unread_count) VALUES (?, ?, ?, ?, 'AI', ?, ?, 1)`)
      .bind(conversationId, input.jid, input.phoneNumber, input.contactName?.trim() || input.phoneNumber, input.content, receivedAt).run();
  } else {
    await db.prepare(`UPDATE whatsapp_conversations SET phone_number = ?, contact_name = CASE WHEN ? <> '' THEN ? ELSE contact_name END, last_message = ?, last_message_at = ?, unread_count = unread_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(input.phoneNumber, input.contactName?.trim() || "", input.contactName?.trim() || "", input.content, receivedAt, conversationId).run();
  }
  await db.prepare(`INSERT OR IGNORE INTO whatsapp_messages (id, conversation_id, provider_message_id, direction, sender_type, content, delivery_status, created_at) VALUES (?, ?, ?, 'INBOUND', 'CONTACT', ?, 'RECEIVED', ?)`)
    .bind(crypto.randomUUID(), conversationId, input.providerMessageId, input.content, receivedAt).run();
  return getWhatsAppConversation(conversationId);
}

export async function recordWhatsAppOutgoing(input: { conversationId: string; providerMessageId?: string | null; content: string; senderType: "AI" | "HUMAN"; sentAt?: string | null }) {
  const db = await ensureDatabase();
  const sentAt = input.sentAt || new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO whatsapp_messages (id, conversation_id, provider_message_id, direction, sender_type, content, delivery_status, created_at) VALUES (?, ?, ?, 'OUTBOUND', ?, ?, 'SENT', ?)`)
      .bind(crypto.randomUUID(), input.conversationId, input.providerMessageId || null, input.senderType, input.content, sentAt),
    db.prepare(`UPDATE whatsapp_conversations SET last_message = ?, last_message_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(input.content, sentAt, input.conversationId),
  ]);
}

export async function setWhatsAppConversationMode(id: string, mode: "AI" | "HUMAN") {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE whatsapp_conversations SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(mode, id).run();
  return getWhatsAppConversation(id);
}

export async function setWhatsAppConversationInterest(id: string, interest: string | null) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE whatsapp_conversations SET product_interest = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(interest, id).run();
}

export async function markWhatsAppConversationRead(id: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE whatsapp_conversations SET unread_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run();
}
