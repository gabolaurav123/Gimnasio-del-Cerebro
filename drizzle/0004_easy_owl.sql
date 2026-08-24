CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`payer_name` text NOT NULL,
	`payer_email` text,
	`payer_phone` text,
	`concept` text NOT NULL,
	`item_type` text DEFAULT 'OTHER' NOT NULL,
	`item_id` text,
	`amount_cents` integer NOT NULL,
	`currency` text DEFAULT 'BOB' NOT NULL,
	`payment_method` text DEFAULT 'OTHER' NOT NULL,
	`provider_reference` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`paid_at` text,
	`verified_at` text,
	`verified_by` text,
	`notes` text,
	`source` text DEFAULT 'MANUAL' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_reference_unique` ON `payments` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_payments_status_created_at` ON `payments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_payments_payer_email` ON `payments` (`payer_email`);