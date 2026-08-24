import { getRuntimeDatabase, isDatabaseUnavailable, type AppDatabase } from "./runtime";
import { getRuntimeValues } from "../lib/runtime-env";

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
  status: string;
  displayOrder: number;
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

export const associateSeeds: Associate[] = [{
  id: "associate-kiryus",
  name: "Comunidad Kiryus",
  url: "https://www.comunidadkiryus.org/",
  description: "Red de ecoaldeas autosustentables orientada a la permacultura, la regeneración ambiental, la sostenibilidad y la vida colaborativa.",
  image: null,
  status: "PUBLISHED",
  displayOrder: 1,
}];

export const trainingSeeds: Training[] = [
  {
    id: "training-nfa",
    name: "Neurofitness Active",
    acronym: "NFA",
    slug: "neurofitness-active",
    shortDescription: "Entrenamiento base orientado a comprender el funcionamiento de la mente y desarrollar capacidades de autogestión.",
    fullDescription: "Un punto de partida para observar el funcionamiento de la mente, reconocer patrones y desarrollar herramientas de autogestión aplicables a la vida cotidiana.",
    logo: "/logos/nfa-full-v2.jpg",
    heroImage: null,
    resourceUrl: null,
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
    heroImage: null,
    resourceUrl: null,
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
    heroImage: null,
    resourceUrl: null,
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
    heroImage: null,
    resourceUrl: null,
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
    heroImage: null,
    resourceUrl: null,
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
    heroImage: null,
    resourceUrl: null,
    status: "PUBLISHED",
    displayOrder: 6,
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
  `CREATE TABLE IF NOT EXISTS trainings (id TEXT PRIMARY KEY, name TEXT NOT NULL, acronym TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT NOT NULL, full_description TEXT NOT NULL DEFAULT '', logo TEXT NOT NULL, hero_image TEXT, resource_url TEXT, cta_label TEXT NOT NULL DEFAULT 'Consultar', status TEXT NOT NULL DEFAULT 'PUBLISHED', display_order INTEGER NOT NULL DEFAULT 0, seo_title TEXT, seo_description TEXT, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL, content TEXT NOT NULL, image TEXT, attachment_url TEXT, author TEXT, category TEXT NOT NULL DEFAULT 'Consciencia', status TEXT NOT NULL DEFAULT 'PUBLISHED', published_at TEXT, seo_title TEXT, seo_description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, country TEXT NOT NULL, training_interest TEXT, message TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'website_contact', status TEXT NOT NULL DEFAULT 'NEW', tags TEXT NOT NULL DEFAULT '[]', assignee TEXT, next_follow_up TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_notes (id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, user_id TEXT, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_activities (id TEXT PRIMARY KEY, contact_id TEXT, action TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, name TEXT NOT NULL, program TEXT, quote TEXT, video_url TEXT, thumbnail TEXT, rating INTEGER, visible INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS media_assets (id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS whatsapp_events (provider_message_id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS appointments (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, country TEXT NOT NULL, preferred_date TEXT NOT NULL, preferred_time TEXT NOT NULL, training_interest TEXT, message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL, image TEXT, price_label TEXT NOT NULL DEFAULT 'Consultar', discount_label TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT NOT NULL, image TEXT, starts_at TEXT NOT NULL, location TEXT NOT NULL, registration_url TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS associates (id TEXT PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, description TEXT NOT NULL, image TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_status_created_at ON contacts(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_training_interest ON contacts(training_interest)`,
  `CREATE INDEX IF NOT EXISTS idx_trainings_status_order ON trainings(status, display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, preferred_date)`,
  `CREATE INDEX IF NOT EXISTS idx_products_status_order ON products(status, display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, starts_at)`,
  `CREATE INDEX IF NOT EXISTS idx_associates_status_order ON associates(status, display_order)`,
];

const postgresSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS media_blobs (media_id TEXT PRIMARY KEY, body BYTEA NOT NULL)`,
];

const additiveMigrations = [
  `ALTER TABLE trainings ADD COLUMN resource_url TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN attachment_url TEXT`,
];

function isExistingColumnError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes("duplicate column") || message.includes("already exists");
}

let ready: Promise<AppDatabase> | null = null;

export function ensureDatabase() {
  if (ready) return ready;
  ready = (async () => {
    const db = await getRuntimeDatabase();
    const statements = db.dialect === "postgres" ? [...schemaStatements, ...postgresSchemaStatements] : schemaStatements;
    await db.batch(statements.map((statement) => db.prepare(statement)));
    for (const statement of additiveMigrations) {
      try {
        await db.prepare(statement).run();
      } catch (error) {
        if (!isExistingColumnError(error)) throw error;
      }
    }
    const adminConfig = await getRuntimeValues(["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH"]);
    if (adminConfig.ADMIN_EMAIL?.trim() && adminConfig.ADMIN_PASSWORD_HASH?.trim()) {
      await db.batch([
        db.prepare(`UPDATE users SET email = ?, password_hash = ?, role = 'SUPERADMIN', active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = 'bootstrap-superadmin'`)
          .bind(adminConfig.ADMIN_EMAIL.trim().toLowerCase(), adminConfig.ADMIN_PASSWORD_HASH.trim()),
        db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, role, active) VALUES ('bootstrap-superadmin', ?, ?, 'SUPERADMIN', 1)`)
          .bind(adminConfig.ADMIN_EMAIL.trim().toLowerCase(), adminConfig.ADMIN_PASSWORD_HASH.trim()),
      ]);
    }
    const trainingBatch = trainingSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO trainings (id, name, acronym, slug, short_description, full_description, logo, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.acronym, item.slug, item.shortDescription, item.fullDescription, item.logo, item.status, item.displayOrder),
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
    const trainingLogoSyncBatch = trainingSeeds.map((item) =>
      db.prepare(`UPDATE trainings SET logo = ? WHERE id = ?`).bind(item.logo, item.id),
    );
    await db.batch([...trainingBatch, ...postBatch, ...testimonialBatch, ...associateBatch, ...trainingLogoSyncBatch]);
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
    message: String(row.message ?? ""), status: String(row.status), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id), name: String(row.name), slug: String(row.slug), description: String(row.description),
    image: row.image ? String(row.image) : null, priceLabel: String(row.price_label),
    discountLabel: row.discount_label ? String(row.discount_label) : null, status: String(row.status), displayOrder: Number(row.display_order),
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

export async function getTrainings(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const statement = includeHidden
      ? db.prepare(`SELECT * FROM trainings WHERE deleted_at IS NULL ORDER BY display_order, name`)
      : db.prepare(`SELECT * FROM trainings WHERE status = 'PUBLISHED' AND deleted_at IS NULL ORDER BY display_order, name`);
    const result = await statement.all<Record<string, unknown>>();
    return result.results.map(mapTraining);
  } catch (error) {
    if (isDatabaseUnavailable(error)) return trainingSeeds.filter((item) => includeHidden || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getTraining(slug: string) {
  try {
    const db = await ensureDatabase();
    const row = await db.prepare(`SELECT * FROM trainings WHERE slug = ? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Record<string, unknown>>();
    return row ? mapTraining(row) : null;
  } catch (error) {
    if (isDatabaseUnavailable(error)) return trainingSeeds.find((item) => item.slug === slug) ?? null;
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
    if (isDatabaseUnavailable(error)) return postSeeds.filter((item) => includeDrafts || item.status === "PUBLISHED");
    throw error;
  }
}

export async function getPost(slug: string) {
  try {
    const db = await ensureDatabase();
    const row = await db.prepare(`SELECT * FROM blog_posts WHERE slug = ? AND status = 'PUBLISHED' LIMIT 1`).bind(slug).first<Record<string, unknown>>();
    return row ? mapPost(row) : null;
  } catch (error) {
    if (isDatabaseUnavailable(error)) return postSeeds.find((item) => item.slug === slug && item.status === "PUBLISHED") ?? null;
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
    if (isDatabaseUnavailable(error)) return testimonialSeeds.filter((item) => includeHidden || item.visible);
    throw error;
  }
}

export async function getProducts(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM products ORDER BY display_order, name` : `SELECT * FROM products WHERE status = 'PUBLISHED' ORDER BY display_order, name`).all<Record<string, unknown>>();
    return result.results.map(mapProduct);
  } catch (error) {
    if (isDatabaseUnavailable(error)) return [];
    throw error;
  }
}

export async function getEvents(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM events ORDER BY starts_at, display_order` : `SELECT * FROM events WHERE status = 'PUBLISHED' ORDER BY starts_at, display_order`).all<Record<string, unknown>>();
    return result.results.map(mapEvent);
  } catch (error) {
    if (isDatabaseUnavailable(error)) return [];
    throw error;
  }
}

export async function getAssociates(includeHidden = false) {
  try {
    const db = await ensureDatabase();
    const result = await db.prepare(includeHidden ? `SELECT * FROM associates ORDER BY display_order, name` : `SELECT * FROM associates WHERE status = 'PUBLISHED' ORDER BY display_order, name`).all<Record<string, unknown>>();
    return result.results.map(mapAssociate);
  } catch (error) {
    if (isDatabaseUnavailable(error)) return associateSeeds.filter((item) => includeHidden || item.status === "PUBLISHED");
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

export async function createAppointment(input: Omit<Appointment, "id" | "status" | "createdAt" | "updatedAt">) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO appointments (id, name, email, phone, country, preferred_date, preferred_time, training_interest, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`)
    .bind(id, input.name, input.email, input.phone, input.country, input.preferredDate, input.preferredTime, input.trainingInterest, input.message).run();
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
  await db.prepare(`INSERT INTO products (id, name, slug, description, image, price_label, discount_label, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.name, input.slug, input.description, input.image, input.priceLabel, input.discountLabel, input.displayOrder).run(); return id;
}

export async function updateProduct(id: string, input: ProductInput) {
  const db = await ensureDatabase(); await db.prepare(`UPDATE products SET name = ?, slug = ?, description = ?, image = ?, price_label = ?, discount_label = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.slug, input.description, input.image, input.priceLabel, input.discountLabel, input.displayOrder, id).run();
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
  const [contactsResult, newResult, appointmentsResult, trainingsResult, postsResult, productsResult, eventsResult, recentResult, activityResult] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM contacts`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM contacts WHERE status = 'NEW'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM appointments WHERE status IN ('PENDING', 'CONFIRMED')`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM trainings WHERE status = 'PUBLISHED' AND deleted_at IS NULL`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM blog_posts WHERE status = 'PUBLISHED'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM products WHERE status = 'PUBLISHED'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM events WHERE status = 'PUBLISHED'`).first<{ count: number }>(),
    db.prepare(`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
    db.prepare(`SELECT * FROM contact_activities ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
  ]);
  return {
    counts: { contacts: Number(contactsResult?.count ?? 0), newContacts: Number(newResult?.count ?? 0), appointments: Number(appointmentsResult?.count ?? 0), trainings: Number(trainingsResult?.count ?? 0), posts: Number(postsResult?.count ?? 0), products: Number(productsResult?.count ?? 0), events: Number(eventsResult?.count ?? 0) },
    recent: recentResult.results.map(mapContact),
    activity: activityResult.results,
  };
}

export type TrainingInput = { name: string; acronym: string; slug: string; shortDescription: string; fullDescription: string; logo: string; heroImage?: string | null; resourceUrl?: string | null; displayOrder: number };

export async function createTraining(input: TrainingInput) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  const result = await db.prepare(`SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM trainings`).first<{ next_order: number }>();
  await db.prepare(`INSERT INTO trainings (id, name, acronym, slug, short_description, full_description, logo, hero_image, resource_url, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`)
    .bind(id, input.name, input.acronym, input.slug, input.shortDescription, input.fullDescription, input.logo, input.heroImage ?? null, input.resourceUrl ?? null, input.displayOrder || result?.next_order || 1).run();
  return id;
}

export async function updateTraining(id: string, input: TrainingInput) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE trainings SET name = ?, acronym = ?, slug = ?, short_description = ?, full_description = ?, logo = ?, hero_image = ?, resource_url = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(input.name, input.acronym, input.slug, input.shortDescription, input.fullDescription, input.logo, input.heroImage ?? null, input.resourceUrl ?? null, input.displayOrder, id).run();
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
  heroEyebrow: "Conocimiento que se convierte en acción",
  heroTitle: "Entrena tu cerebro. Transforma tu vida.",
  heroDescription: "Más de una década acompañando a personas en el desarrollo de una vida más consciente.",
  ctaTitle: "El cambio comienza cuando comprendes cómo funciona tu mente.",
  ctaDescription: "Descubre el entrenamiento que mejor se adapta a tu momento actual.",
  instagram: "",
  facebook: "",
  youtube: "",
  whatsappAiEnabled: "false",
  whatsappAiModel: "gpt-5-mini",
  whatsappAiInstructions: "Responde en español de forma clara, cercana y breve como asistente de Gimnasio del Cerebro. Orienta sobre los entrenamientos sin inventar precios, certificaciones, resultados ni afirmaciones médicas. Si la consulta requiere decisión humana, pide los datos de contacto y avisa que un asesor continuará.",
};

export async function getSettings() {
  try {
    const db = await ensureDatabase();
    const runtime = await getRuntimeValues(["WHATSAPP_NUMBER"]);
    const initialSettings = { ...defaultSettings, whatsapp: runtime.WHATSAPP_NUMBER?.trim() || defaultSettings.whatsapp };
    const inserts = Object.entries(initialSettings).map(([key, value]) => db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`).bind(key, value));
    await db.batch(inserts);
    const result = await db.prepare(`SELECT key, value FROM site_settings`).all<{ key: string; value: string }>();
    return Object.fromEntries(result.results.map((row) => [row.key, row.value]));
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      const runtime = await getRuntimeValues(["WHATSAPP_NUMBER"]);
      return { ...defaultSettings, whatsapp: runtime.WHATSAPP_NUMBER?.trim() || defaultSettings.whatsapp };
    }
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
