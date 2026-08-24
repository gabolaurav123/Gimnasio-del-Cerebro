import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  message: text("message").notNull().default(""),
  status: text("status", { enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] }).notNull().default("PENDING"),
  ...timestamps,
}, (table) => [index("idx_appointments_status_date").on(table.status, table.preferredDate)]);

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image"),
  priceLabel: text("price_label").notNull().default("Consultar"),
  discountLabel: text("discount_label"),
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
