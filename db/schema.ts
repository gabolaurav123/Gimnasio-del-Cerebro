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
  checkoutExternalId: text("checkout_external_id"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("BOB"),
  ctaLabel: text("cta_label").notNull().default("Consultar"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("PUBLISHED"),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  deletedAt: text("deleted_at"),
  ...timestamps,
}, (table) => [
  index("idx_trainings_status_order").on(table.status, table.displayOrder),
  uniqueIndex("idx_trainings_provider_external_unique").on(table.checkoutProvider, table.checkoutExternalId).where(sql`checkout_external_id IS NOT NULL`),
]);

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

export const systemSecrets = sqliteTable("system_secrets", {
  key: text("key").primaryKey(),
  encryptedValue: text("encrypted_value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const whatsappEvents = sqliteTable("whatsapp_events", {
  providerMessageId: text("provider_message_id").primaryKey(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const whatsappAuthCredentials = sqliteTable("whatsapp_auth_credentials", {
  id: text("id").primaryKey(),
  encryptedValue: text("encrypted_value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const whatsappAuthKeys = sqliteTable("whatsapp_auth_keys", {
  category: text("category").notNull(),
  keyId: text("key_id").notNull(),
  encryptedValue: text("encrypted_value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_whatsapp_auth_keys_unique").on(table.category, table.keyId)]);

export const whatsappSessionMetadata = sqliteTable("whatsapp_session_metadata", {
  id: text("id").primaryKey(),
  phoneNumber: text("phone_number"),
  accountName: text("account_name"),
  lastConnectedAt: text("last_connected_at"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const whatsappConversations = sqliteTable("whatsapp_conversations", {
  id: text("id").primaryKey(),
  jid: text("jid").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  contactName: text("contact_name").notNull().default("Contacto"),
  mode: text("mode", { enum: ["AI", "HUMAN"] }).notNull().default("AI"),
  productInterest: text("product_interest"),
  lastMessage: text("last_message").notNull().default(""),
  lastMessageAt: text("last_message_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  unreadCount: integer("unread_count").notNull().default(0),
  ...timestamps,
}, (table) => [
  index("idx_whatsapp_conversations_updated").on(table.lastMessageAt),
  index("idx_whatsapp_conversations_mode").on(table.mode),
]);

export const whatsappMessages = sqliteTable("whatsapp_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  providerMessageId: text("provider_message_id").unique(),
  direction: text("direction", { enum: ["INBOUND", "OUTBOUND"] }).notNull(),
  senderType: text("sender_type", { enum: ["CONTACT", "AI", "HUMAN"] }).notNull(),
  content: text("content").notNull(),
  deliveryStatus: text("delivery_status").notNull().default("SENT"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_whatsapp_messages_conversation").on(table.conversationId, table.createdAt)]);

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
  recurrence: text("recurrence", { enum: ["DATE", "WEEKLY"] }).notNull().default("DATE"),
  weekday: integer("weekday"),
  endDate: text("end_date"),
  reason: text("reason").notNull().default("Horario no disponible"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  index("idx_appointment_blocks_date_active").on(table.date, table.active),
  index("idx_appointment_blocks_recurrence_active").on(table.recurrence, table.weekday, table.active),
]);

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
  checkoutExternalId: text("checkout_external_id"),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("BOB"),
  status: text("status", { enum: ["DRAFT", "PUBLISHED", "HIDDEN"] }).notNull().default("DRAFT"),
  displayOrder: integer("display_order").notNull().default(0),
  deletedAt: text("deleted_at"),
  ...timestamps,
}, (table) => [
  index("idx_products_status_order").on(table.status, table.displayOrder),
  uniqueIndex("idx_products_provider_external_unique").on(table.checkoutProvider, table.checkoutExternalId).where(sql`checkout_external_id IS NOT NULL`),
]);

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
}, (table) => [
  index("idx_payments_status_created_at").on(table.status, table.createdAt),
  index("idx_payments_payer_email").on(table.payerEmail),
  index("idx_payments_provider_reference").on(table.source, table.providerReference),
  uniqueIndex("idx_payments_source_provider_reference_unique").on(table.source, table.providerReference).where(sql`provider_reference IS NOT NULL`),
]);

export const paymentWebhookEvents = sqliteTable("payment_webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider", { enum: ["STRIPE", "HOTMART"] }).notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  status: text("status", { enum: ["PROCESSING", "PROCESSED", "IGNORED", "FAILED"] }).notNull().default("PROCESSING"),
  payloadHash: text("payload_hash"),
  error: text("error"),
  processedAt: text("processed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("idx_payment_webhook_events_provider_event").on(table.provider, table.eventId)]);

export const purchaseEmailOutbox = sqliteTable("purchase_email_outbox", {
  paymentId: text("payment_id").primaryKey(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  status: text("status", { enum: ["PENDING", "SENT", "FAILED", "SKIPPED"] }).notNull().default("PENDING"),
  attempts: integer("attempts").notNull().default(0),
  providerMessageId: text("provider_message_id"),
  lastError: text("last_error"),
  sentAt: text("sent_at"),
  ...timestamps,
}, (table) => [index("idx_purchase_email_outbox_status_updated").on(table.status, table.updatedAt)]);

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
  deletedAt: text("deleted_at"),
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

export const neurofitnessAttempts = sqliteTable("neurofitness_attempts", {
  id: text("id").primaryKey(),
  campaignKey: text("campaign_key").notNull(),
  version: integer("version").notNull().default(1),
  tokenHash: text("token_hash").notNull().unique(),
  seed: integer("seed").notNull(),
  status: text("status", { enum: ["STARTED", "COMPLETED", "CLAIMING", "CLAIMED", "INVALID"] }).notNull().default("STARTED"),
  metricsJson: text("metrics_json"),
  focusScore: integer("focus_score"),
  controlScore: integer("control_score"),
  memoryScore: integer("memory_score"),
  flexibilityScore: integer("flexibility_score"),
  totalScore: integer("total_score"),
  bestDomain: text("best_domain"),
  participantId: text("participant_id"),
  durationMs: integer("duration_ms"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  claimedAt: text("claimed_at"),
  whatsappDeliveryStatus: text("whatsapp_delivery_status", { enum: ["PENDING", "SENDING", "SENT", "FAILED", "SKIPPED"] }).notNull().default("PENDING"),
  whatsappDeliveryStartedAt: text("whatsapp_delivery_started_at"),
  whatsappMessageId: text("whatsapp_message_id"),
  whatsappDeliveryError: text("whatsapp_delivery_error"),
  whatsappDeliveredAt: text("whatsapp_delivered_at"),
  ...timestamps,
}, (table) => [
  index("idx_neurofitness_attempts_campaign_status").on(table.campaignKey, table.status),
  index("idx_neurofitness_attempts_campaign_score").on(table.campaignKey, table.totalScore),
  index("idx_neurofitness_attempts_created_at").on(table.createdAt),
]);

export const neurofitnessParticipants = sqliteTable("neurofitness_participants", {
  id: text("id").primaryKey(),
  campaignKey: text("campaign_key").notNull(),
  name: text("name").notNull(),
  rankingAlias: text("ranking_alias"),
  phone: text("phone").notNull(),
  phoneHash: text("phone_hash").notNull(),
  bestAttemptId: text("best_attempt_id").notNull(),
  resultConsentAt: text("result_consent_at").notNull(),
  marketingConsentAt: text("marketing_consent_at"),
  rankingConsentAt: text("ranking_consent_at"),
  consentVersion: text("consent_version").notNull().default("neurofitness-2026-09"),
  sourceEvent: text("source_event").notNull().default("CCM"),
  whatsappDeliveryStatus: text("whatsapp_delivery_status", { enum: ["PENDING", "SENT", "FAILED", "SKIPPED"] }).notNull().default("PENDING"),
  whatsappAttemptId: text("whatsapp_attempt_id"),
  whatsappMessageId: text("whatsapp_message_id"),
  whatsappDeliveryError: text("whatsapp_delivery_error"),
  whatsappDeliveredAt: text("whatsapp_delivered_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("idx_neurofitness_participants_campaign_phone").on(table.campaignKey, table.phoneHash),
  index("idx_neurofitness_participants_best_attempt").on(table.bestAttemptId),
  index("idx_neurofitness_participants_ranking").on(table.campaignKey, table.rankingConsentAt),
]);
