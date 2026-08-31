import { getDatabase } from "./repository";

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  country: string | null;
  active: boolean;
  termsVersion: string;
  termsAcceptedAt: string;
  privacyAcceptedAt: string;
  createdAt: string;
};

export type CustomerEntitlement = {
  id: string;
  itemType: "PRODUCT" | "TRAINING";
  itemId: string;
  itemName: string;
  itemSlug: string;
  itemImage: string | null;
  dashboardContent: string | null;
  resourceUrl: string | null;
  status: string;
  grantedAt: string;
};

export type AssistantProfile = {
  id: string;
  itemType: "PRODUCT" | "TRAINING";
  itemId: string;
  itemName: string;
  name: string;
  instructions: string;
  model: string;
  enabled: boolean;
  updatedAt: string;
};

function mapCustomer(row: Record<string, unknown>): CustomerUser {
  return {
    id: String(row.id), name: String(row.name), email: String(row.email), passwordHash: String(row.password_hash),
    phone: row.phone ? String(row.phone) : null, country: row.country ? String(row.country) : null,
    active: Boolean(Number(row.active)), termsVersion: String(row.terms_version), termsAcceptedAt: String(row.terms_accepted_at),
    privacyAcceptedAt: String(row.privacy_accepted_at), createdAt: String(row.created_at),
  };
}

export async function getCustomerByEmail(email: string) {
  const db = await getDatabase();
  const row = await db.prepare(`SELECT * FROM customer_users WHERE email = ? LIMIT 1`).bind(email.trim().toLowerCase()).first<Record<string, unknown>>();
  return row ? mapCustomer(row) : null;
}

export async function getCustomerById(id: string) {
  const db = await getDatabase();
  const row = await db.prepare(`SELECT * FROM customer_users WHERE id = ? LIMIT 1`).bind(id).first<Record<string, unknown>>();
  return row ? mapCustomer(row) : null;
}

export async function createCustomer(input: { name: string; email: string; passwordHash: string; phone?: string | null; country?: string | null; termsVersion: string }) {
  const db = await getDatabase();
  const id = crypto.randomUUID();
  const acceptedAt = new Date().toISOString();
  await db.prepare(`INSERT INTO customer_users (id, name, email, password_hash, phone, country, active, terms_version, terms_accepted_at, privacy_accepted_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`)
    .bind(id, input.name.trim(), input.email.trim().toLowerCase(), input.passwordHash, input.phone || null, input.country || null, input.termsVersion, acceptedAt, acceptedAt).run();
  return getCustomerById(id);
}

export async function getCustomers() {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT c.*, COUNT(e.id) AS access_count FROM customer_users c LEFT JOIN customer_entitlements e ON e.customer_id = c.id AND e.status = 'ACTIVE' GROUP BY c.id ORDER BY c.created_at DESC`).all<Record<string, unknown>>();
  return result.results.map((row) => ({ ...mapCustomer(row), accessCount: Number(row.access_count || 0) }));
}

export async function setCustomerActive(id: string, active: boolean) {
  const db = await getDatabase();
  await db.prepare(`UPDATE customer_users SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(active ? 1 : 0, id).run();
}

export async function getCustomerEntitlements(customerId: string): Promise<CustomerEntitlement[]> {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT e.*, CASE WHEN e.item_type = 'PRODUCT' THEN p.name ELSE t.name END AS item_name, CASE WHEN e.item_type = 'PRODUCT' THEN p.slug ELSE t.slug END AS item_slug, CASE WHEN e.item_type = 'PRODUCT' THEN p.image ELSE COALESCE(t.hero_image, t.logo) END AS item_image, CASE WHEN e.item_type = 'PRODUCT' THEN p.dashboard_content ELSE t.dashboard_content END AS dashboard_content, CASE WHEN e.item_type = 'PRODUCT' THEN p.resource_url ELSE t.resource_url END AS resource_url FROM customer_entitlements e LEFT JOIN products p ON e.item_type = 'PRODUCT' AND e.item_id = p.id LEFT JOIN trainings t ON e.item_type = 'TRAINING' AND e.item_id = t.id WHERE e.customer_id = ? AND e.status = 'ACTIVE' ORDER BY e.granted_at DESC`)
    .bind(customerId).all<Record<string, unknown>>();
  return result.results.map((row) => ({
    id: String(row.id), itemType: String(row.item_type) as CustomerEntitlement["itemType"], itemId: String(row.item_id),
    itemName: String(row.item_name || "Contenido"), itemSlug: String(row.item_slug || ""), itemImage: row.item_image ? String(row.item_image) : null,
    dashboardContent: row.dashboard_content ? String(row.dashboard_content) : null, resourceUrl: row.resource_url ? String(row.resource_url) : null,
    status: String(row.status), grantedAt: String(row.granted_at),
  }));
}

function mapAssistant(row: Record<string, unknown>): AssistantProfile {
  return {
    id: String(row.id), itemType: String(row.item_type) as AssistantProfile["itemType"], itemId: String(row.item_id),
    itemName: String(row.item_name || "Contenido"), name: String(row.name), instructions: String(row.instructions),
    model: String(row.model), enabled: Boolean(Number(row.enabled)), updatedAt: String(row.updated_at),
  };
}

export async function getAssistantProfiles() {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT a.*, CASE WHEN a.item_type = 'PRODUCT' THEN p.name ELSE t.name END AS item_name FROM assistant_profiles a LEFT JOIN products p ON a.item_type = 'PRODUCT' AND a.item_id = p.id LEFT JOIN trainings t ON a.item_type = 'TRAINING' AND a.item_id = t.id ORDER BY a.updated_at DESC`).all<Record<string, unknown>>();
  return result.results.map(mapAssistant);
}

export async function upsertAssistantProfile(input: Omit<AssistantProfile, "id" | "itemName" | "updatedAt">) {
  const db = await getDatabase();
  const existing = await db.prepare(`SELECT id FROM assistant_profiles WHERE item_type = ? AND item_id = ? LIMIT 1`).bind(input.itemType, input.itemId).first<{ id: string }>();
  if (existing) {
    await db.prepare(`UPDATE assistant_profiles SET name = ?, instructions = ?, model = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(input.name, input.instructions, input.model, input.enabled ? 1 : 0, existing.id).run();
    return existing.id;
  }
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO assistant_profiles (id, item_type, item_id, name, instructions, model, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, input.itemType, input.itemId, input.name, input.instructions, input.model, input.enabled ? 1 : 0).run();
  return id;
}

export async function getCustomerAssistant(customerId: string, assistantId: string) {
  const db = await getDatabase();
  const row = await db.prepare(`SELECT a.*, CASE WHEN a.item_type = 'PRODUCT' THEN p.name ELSE t.name END AS item_name FROM assistant_profiles a JOIN customer_entitlements e ON e.customer_id = ? AND e.item_type = a.item_type AND e.item_id = a.item_id AND e.status = 'ACTIVE' LEFT JOIN products p ON a.item_type = 'PRODUCT' AND a.item_id = p.id LEFT JOIN trainings t ON a.item_type = 'TRAINING' AND a.item_id = t.id WHERE a.id = ? AND a.enabled = 1 LIMIT 1`)
    .bind(customerId, assistantId).first<Record<string, unknown>>();
  return row ? mapAssistant(row) : null;
}

export async function getCustomerAssistants(customerId: string) {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT a.*, CASE WHEN a.item_type = 'PRODUCT' THEN p.name ELSE t.name END AS item_name FROM assistant_profiles a JOIN customer_entitlements e ON e.customer_id = ? AND e.item_type = a.item_type AND e.item_id = a.item_id AND e.status = 'ACTIVE' LEFT JOIN products p ON a.item_type = 'PRODUCT' AND a.item_id = p.id LEFT JOIN trainings t ON a.item_type = 'TRAINING' AND a.item_id = t.id WHERE a.enabled = 1 ORDER BY a.name`).bind(customerId).all<Record<string, unknown>>();
  return result.results.map(mapAssistant);
}

export async function getAssistantMessages(customerId: string, profileId: string, limit = 16) {
  const db = await getDatabase();
  const result = await db.prepare(`SELECT role, content, created_at FROM assistant_messages WHERE customer_id = ? AND assistant_profile_id = ? ORDER BY created_at DESC LIMIT ?`).bind(customerId, profileId, limit).all<{ role: "user" | "assistant"; content: string; created_at: string }>();
  return result.results.reverse().map((row) => ({ role: row.role, content: row.content, createdAt: row.created_at }));
}

export async function addAssistantMessage(customerId: string, profileId: string, role: "user" | "assistant", content: string) {
  const db = await getDatabase();
  await db.prepare(`INSERT INTO assistant_messages (id, customer_id, assistant_profile_id, role, content) VALUES (?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), customerId, profileId, role, content).run();
}
