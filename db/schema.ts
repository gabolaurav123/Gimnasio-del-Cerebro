import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["SUPERADMIN", "EDITOR", "COMERCIAL"] }).notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const trainings = sqliteTable("trainings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  acronym: text("acronym").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull().default(""),
  logo: text("logo").notNull(),
  heroImage: text("hero_image"),
  resourceUrl: text("resource_url"),
  dashboardContent: text("dashboard_content"),
  checkoutProvider: text("checkout_provider", { enum: ["STRIPE", "HOTMART", "MANUAL"] }).notNull().default("MANUAL"),
  checkoutUrl: text("checkout_url"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("BOB"),
  ctaLabel: text("cta_label").notNull().default("Consultar"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("PUBLISHED"),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  deletedAt: text("deleted_at"),
  ...timestamps,
}, (table) => [index("idx_trainings_status_order").on(table.status, table.displayOrder)]);

export const blogCategories = sqliteTable("blog_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...timestamps,
});

export const blogTags = sqliteTable("blog_tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...timestamps,
});

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  attachmentUrl: text("attachment_url"),
  author: text("author"),
  category: text("category").notNull().default("Consciencia"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] }).notNull().default("PUBLISHED"),
  publishedAt: text("published_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ...timestamps,
}, (table) => [index("idx_blog_posts_status_published_at").on(table.status, table.publishedAt)]);

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  trainingInterest: text("training_interest"),
  message: text("message").notNull(),
  source: text("source").notNull().default("website_contact"),
  status: text("status").notNull().default("NEW"),
  tags: text("tags").notNull().default("[]"),
  assignee: text("assignee"),
  nextFollowUp: text("next_follow_up"),
  ...timestamps,
}, (table) => [index("idx_contacts_status_created_at").on(table.status, table.createdAt), index("idx_contacts_training_interest").on(table.trainingInterest)]);

export const contactNotes = sqliteTable("contact_notes", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull(),
  userId: text("user_id"),
  body: text("body").notNull(),
  ...timestamps,
});

export const contactActivities = sqliteTable("contact_activities", {
  id: text("id").primaryKey(),
  contactId: text("contact_id"),
  action: text("action").notNull(),
  metadata: text("metadata").notNull().default("{}"),
  ...timestamps,
}, (table) => [index("idx_contact_activities_contact_id").on(table.contactId)]);

export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  program: text("program"),
  quote: text("quote"),
  videoUrl: text("video_url"),
  thumbnail: text("thumbnail"),
  rating: integer("rating"),
  visible: integer("visible", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  ...timestamps,
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const whatsappEvents = sqliteTable("whatsapp_events", {
  providerMessageId: text("provider_message_id").primaryKey(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  trainingInterest: text("training_interest"),
  appointmentType: text("appointment_type", { enum: ["CONSULTATION", "TRAINING"] }).notNull().default("CONSULTATION"),
  disclaimerAcceptedAt: text("disclaimer_accepted_at"),
  message: text("message").notNull().default(""),
  status: text("status", { enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] }).notNull().default("PENDING"),
  ...timestamps,
}, (table) => [index("idx_appointments_status_date").on(table.status, table.preferredDate), uniqueIndex("idx_appointments_active_slot").on(table.preferredDate, table.preferredTime).where(sql`${table.status} IN ('PENDING', 'CONFIRMED')`)]);

export const appointmentBlocks = sqliteTable("appointment_blocks", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  appointmentType: text("appointment_type", { enum: ["ALL", "CONSULTATION", "TRAINING"] }).notNull().default("ALL"),
  reason: text("reason").notNull().default("Horario no disponible"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [index("idx_appointment_blocks_date_active").on(table.date, table.active)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  priceLabel: text("price_label").notNull().default("Consultar"),
  discountLabel: text("discount_label"),
  resourceUrl: text("resource_url"),
  dashboardContent: text("dashboard_content"),
  checkoutProvider: text("checkout_provider", { enum: ["STRIPE", "HOTMART", "MANUAL"] }).notNull().default("MANUAL"),
  checkoutUrl: text("checkout_url"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("BOB"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("DRAFT"),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("idx_products_status_order").on(table.status, table.displayOrder)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  payerName: text("payer_name").notNull(),
  payerEmail: text("payer_email"),
  payerPhone: text("payer_phone"),
  customerId: text("customer_id"),
  concept: text("concept").notNull(),
  itemType: text("item_type", { enum: ["PRODUCT", "TRAINING", "EVENT", "OTHER"] }).notNull().default("OTHER"),
  itemId: text("item_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("BOB"),
  paymentMethod: text("payment_method", { enum: ["BANK_TRANSFER", "QR", "CASH", "CARD", "OTHER"] }).notNull().default("OTHER"),
  providerReference: text("provider_reference"),
  status: text("status", { enum: ["PENDING", "VERIFIED", "REJECTED", "REFUNDED"] }).notNull().default("PENDING"),
  paidAt: text("paid_at"),
  verifiedAt: text("verified_at"),
  verifiedBy: text("verified_by"),
  notes: text("notes"),
  source: text("source").notNull().default("MANUAL"),
  ...timestamps,
}, (table) => [index("idx_payments_status_created_at").on(table.status, table.createdAt), index("idx_payments_payer_email").on(table.payerEmail)]);

export const customerUsers = sqliteTable("customer_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  country: text("country"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  termsVersion: text("terms_version").notNull(),
  termsAcceptedAt: text("terms_accepted_at").notNull(),
  privacyAcceptedAt: text("privacy_accepted_at").notNull(),
  ...timestamps,
}, (table) => [index("idx_customer_users_email_active").on(table.email, table.active)]);

export const customerEntitlements = sqliteTable("customer_entitlements", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  itemType: text("item_type", { enum: ["PRODUCT", "TRAINING"] }).notNull(),
  itemId: text("item_id").notNull(),
  paymentId: text("payment_id"),
  status: text("status", { enum: ["ACTIVE", "SUSPENDED", "EXPIRED"] }).notNull().default("ACTIVE"),
  grantedAt: text("granted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at"),
  ...timestamps,
}, (table) => [index("idx_customer_entitlements_customer_status").on(table.customerId, table.status), index("idx_customer_entitlements_item").on(table.itemType, table.itemId), uniqueIndex("idx_customer_entitlements_unique").on(table.customerId, table.itemType, table.itemId)]);

export const assistantProfiles = sqliteTable("assistant_profiles", {
  id: text("id").primaryKey(),
  itemType: text("item_type", { enum: ["PRODUCT", "TRAINING"] }).notNull(),
  itemId: text("item_id").notNull(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  model: text("model").notNull().default("gpt-5.6-luna"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [index("idx_assistant_profiles_item").on(table.itemType, table.itemId), uniqueIndex("idx_assistant_profiles_item_unique").on(table.itemType, table.itemId)]);

export const assistantMessages = sqliteTable("assistant_messages", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  assistantProfileId: text("assistant_profile_id").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_assistant_messages_customer_profile").on(table.customerId, table.assistantProfileId, table.createdAt)]);

export const accountingEntries = sqliteTable("accounting_entries", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id"),
  entryType: text("entry_type", { enum: ["INCOME", "FEE", "TAX", "REFUND", "EXPENSE", "ADJUSTMENT"] }).notNull(),
  category: text("category").notNull(),
  itemType: text("item_type", { enum: ["PRODUCT", "TRAINING", "EVENT", "GENERAL"] }).notNull().default("GENERAL"),
  itemId: text("item_id"),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("BOB"),
  occurredAt: text("occurred_at").notNull(),
  createdBy: text("created_by"),
  ...timestamps,
}, (table) => [index("idx_accounting_entries_date_type").on(table.occurredAt, table.entryType), index("idx_accounting_entries_item").on(table.itemType, table.itemId)]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  startsAt: text("starts_at").notNull(),
  location: text("location").notNull(),
  registrationUrl: text("registration_url"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("DRAFT"),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("idx_events_status_date").on(table.status, table.startsAt)]);

export const associates = sqliteTable("associates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("DRAFT"),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
}, (table) => [index("idx_associates_status_order").on(table.status, table.displayOrder)]);
