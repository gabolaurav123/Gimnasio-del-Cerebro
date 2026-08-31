CREATE TABLE `accounting_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text,
	`entry_type` text NOT NULL,
	`category` text NOT NULL,
	`item_type` text DEFAULT 'GENERAL' NOT NULL,
	`item_id` text,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'BOB' NOT NULL,
	`occurred_at` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_accounting_entries_date_type` ON `accounting_entries` (`occurred_at`,`entry_type`);--> statement-breakpoint
CREATE INDEX `idx_accounting_entries_item` ON `accounting_entries` (`item_type`,`item_id`);--> statement-breakpoint
CREATE TABLE `appointment_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`appointment_type` text DEFAULT 'ALL' NOT NULL,
	`reason` text DEFAULT 'Horario no disponible' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_appointment_blocks_date_active` ON `appointment_blocks` (`date`,`active`);--> statement-breakpoint
CREATE TABLE `assistant_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`assistant_profile_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_assistant_messages_customer_profile` ON `assistant_messages` (`customer_id`,`assistant_profile_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `assistant_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`name` text NOT NULL,
	`instructions` text NOT NULL,
	`model` text DEFAULT 'gpt-5.6-luna' NOT NULL,
	`enabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_assistant_profiles_item` ON `assistant_profiles` (`item_type`,`item_id`);--> statement-breakpoint
CREATE TABLE `customer_entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`payment_id` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`granted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_customer_entitlements_customer_status` ON `customer_entitlements` (`customer_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_customer_entitlements_item` ON `customer_entitlements` (`item_type`,`item_id`);--> statement-breakpoint
CREATE TABLE `customer_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`country` text,
	`active` integer DEFAULT true NOT NULL,
	`terms_version` text NOT NULL,
	`terms_accepted_at` text NOT NULL,
	`privacy_accepted_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_users_email_unique` ON `customer_users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customer_users_email_active` ON `customer_users` (`email`,`active`);--> statement-breakpoint
ALTER TABLE `appointments` ADD `appointment_type` text DEFAULT 'CONSULTATION' NOT NULL;--> statement-breakpoint
ALTER TABLE `appointments` ADD `disclaimer_accepted_at` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `customer_id` text;--> statement-breakpoint
ALTER TABLE `products` ADD `resource_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `dashboard_content` text;--> statement-breakpoint
ALTER TABLE `products` ADD `checkout_provider` text DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `checkout_url` text;--> statement-breakpoint
ALTER TABLE `products` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `currency` text DEFAULT 'BOB' NOT NULL;--> statement-breakpoint
ALTER TABLE `trainings` ADD `dashboard_content` text;--> statement-breakpoint
ALTER TABLE `trainings` ADD `checkout_provider` text DEFAULT 'MANUAL' NOT NULL;--> statement-breakpoint
ALTER TABLE `trainings` ADD `checkout_url` text;--> statement-breakpoint
ALTER TABLE `trainings` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trainings` ADD `currency` text DEFAULT 'BOB' NOT NULL;