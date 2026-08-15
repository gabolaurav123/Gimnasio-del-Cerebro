import { getRuntimeDatabase, isDatabaseUnavailable, type AppDatabase } from "./runtime";

export type Training = {
  id: string;
  name: string;
  acronym: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  logo: string;
  status: string;
  displayOrder: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string | null;
  status: string;
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

export const trainingSeeds: Training[] = [
  {
    id: "training-nfa",
    name: "Neurofitness Active",
    acronym: "NFA",
    slug: "neurofitness-active",
    shortDescription: "Entrenamiento base orientado a comprender el funcionamiento de la mente y desarrollar capacidades de autogestión.",
    fullDescription: "Un punto de partida para observar el funcionamiento de la mente, reconocer patrones y desarrollar herramientas de autogestión aplicables a la vida cotidiana.",
    logo: "/logos/nfa.jpg",
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
    logo: "/logos/ntr.jpg",
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
    logo: "/logos/bft.jpg",
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
    logo: "/logos/ntm.jpg",
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
    logo: "/logos/alp.jpg",
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
    logo: "/logos/nco.jpg",
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
    category: "Desarrollo personal",
    publishedAt: "2026-05-08",
    status: "PUBLISHED",
  },
];

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS trainings (id TEXT PRIMARY KEY, name TEXT NOT NULL, acronym TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, short_description TEXT NOT NULL, full_description TEXT NOT NULL DEFAULT '', logo TEXT NOT NULL, hero_image TEXT, cta_label TEXT NOT NULL DEFAULT 'Consultar', status TEXT NOT NULL DEFAULT 'PUBLISHED', display_order INTEGER NOT NULL DEFAULT 0, seo_title TEXT, seo_description TEXT, deleted_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL, content TEXT NOT NULL, image TEXT, author TEXT, category TEXT NOT NULL DEFAULT 'Consciencia', status TEXT NOT NULL DEFAULT 'PUBLISHED', published_at TEXT, seo_title TEXT, seo_description TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, country TEXT NOT NULL, training_interest TEXT, message TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'website_contact', status TEXT NOT NULL DEFAULT 'NEW', tags TEXT NOT NULL DEFAULT '[]', assignee TEXT, next_follow_up TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_notes (id TEXT PRIMARY KEY, contact_id TEXT NOT NULL, user_id TEXT, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS contact_activities (id TEXT PRIMARY KEY, contact_id TEXT, action TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, name TEXT NOT NULL, program TEXT, quote TEXT, video_url TEXT, thumbnail TEXT, rating INTEGER, visible INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS media_assets (id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL UNIQUE, mime_type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_status_created_at ON contacts(status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contacts_training_interest ON contacts(training_interest)`,
  `CREATE INDEX IF NOT EXISTS idx_trainings_status_order ON trainings(status, display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at ON blog_posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id)`,
];

const postgresSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS media_blobs (media_id TEXT PRIMARY KEY, body BYTEA NOT NULL)`,
];

let ready: Promise<AppDatabase> | null = null;

export function ensureDatabase() {
  if (ready) return ready;
  ready = (async () => {
    const db = await getRuntimeDatabase();
    const statements = db.dialect === "postgres" ? [...schemaStatements, ...postgresSchemaStatements] : schemaStatements;
    await db.batch(statements.map((statement) => db.prepare(statement)));
    const trainingBatch = trainingSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO trainings (id, name, acronym, slug, short_description, full_description, logo, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.name, item.acronym, item.slug, item.shortDescription, item.fullDescription, item.logo, item.status, item.displayOrder),
    );
    const postBatch = postSeeds.map((item) =>
      db.prepare(`INSERT OR IGNORE INTO blog_posts (id, title, slug, excerpt, content, category, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(item.id, item.title, item.slug, item.excerpt, item.content, item.category, item.status, item.publishedAt),
    );
    await db.batch([...trainingBatch, ...postBatch]);
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
    category: String(row.category),
    publishedAt: row.published_at ? String(row.published_at) : null,
    status: String(row.status),
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
  const [contactsResult, newResult, trainingsResult, postsResult, recentResult, activityResult] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM contacts`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM contacts WHERE status = 'NEW'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM trainings WHERE status = 'PUBLISHED' AND deleted_at IS NULL`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) AS count FROM blog_posts WHERE status = 'PUBLISHED'`).first<{ count: number }>(),
    db.prepare(`SELECT * FROM contacts ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
    db.prepare(`SELECT * FROM contact_activities ORDER BY created_at DESC LIMIT 6`).all<Record<string, unknown>>(),
  ]);
  return {
    counts: { contacts: Number(contactsResult?.count ?? 0), newContacts: Number(newResult?.count ?? 0), trainings: Number(trainingsResult?.count ?? 0), posts: Number(postsResult?.count ?? 0) },
    recent: recentResult.results.map(mapContact),
    activity: activityResult.results,
  };
}

export async function createTraining(input: { name: string; acronym: string; slug: string; shortDescription: string }) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  const result = await db.prepare(`SELECT COALESCE(MAX(display_order), 0) + 1 AS next_order FROM trainings`).first<{ next_order: number }>();
  await db.prepare(`INSERT INTO trainings (id, name, acronym, slug, short_description, full_description, logo, status, display_order) VALUES (?, ?, ?, ?, ?, ?, '/logos/gdc-primary.jpg', 'DRAFT', ?)`)
    .bind(id, input.name, input.acronym, input.slug, input.shortDescription, input.shortDescription, result?.next_order ?? 1).run();
  return id;
}

export async function setTrainingStatus(id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE trainings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, id).run();
}

export async function createPost(input: { title: string; slug: string; excerpt: string; content: string; category: string }) {
  const db = await ensureDatabase();
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO blog_posts (id, title, slug, excerpt, content, category, status) VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`)
    .bind(id, input.title, input.slug, input.excerpt, input.content, input.category).run();
  return id;
}

export async function setPostStatus(id: string, status: string) {
  const db = await ensureDatabase();
  await db.prepare(`UPDATE blog_posts SET status = ?, published_at = CASE WHEN ? = 'PUBLISHED' THEN COALESCE(published_at, date('now')) ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(status, status, id).run();
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
};

export async function getSettings() {
  try {
    const db = await ensureDatabase();
    const inserts = Object.entries(defaultSettings).map(([key, value]) => db.prepare(`INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)`).bind(key, value));
    await db.batch(inserts);
    const result = await db.prepare(`SELECT key, value FROM site_settings`).all<{ key: string; value: string }>();
    return Object.fromEntries(result.results.map((row) => [row.key, row.value]));
  } catch (error) {
    if (isDatabaseUnavailable(error)) return { ...defaultSettings };
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
