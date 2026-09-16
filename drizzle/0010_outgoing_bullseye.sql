CREATE TABLE IF NOT EXISTS `neurofitness_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_key` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`token_hash` text NOT NULL,
	`seed` integer NOT NULL,
	`status` text DEFAULT 'STARTED' NOT NULL,
	`metrics_json` text,
	`focus_score` integer,
	`control_score` integer,
	`memory_score` integer,
	`flexibility_score` integer,
	`total_score` integer,
	`best_domain` text,
	`participant_id` text,
	`duration_ms` integer,
	`started_at` text NOT NULL,
	`completed_at` text,
	`claimed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `neurofitness_attempts_token_hash_unique` ON `neurofitness_attempts` (`token_hash`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_neurofitness_attempts_campaign_status` ON `neurofitness_attempts` (`campaign_key`,`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_neurofitness_attempts_campaign_score` ON `neurofitness_attempts` (`campaign_key`,`total_score`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_neurofitness_attempts_created_at` ON `neurofitness_attempts` (`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `neurofitness_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_key` text NOT NULL,
	`name` text NOT NULL,
	`ranking_alias` text,
	`phone` text NOT NULL,
	`phone_hash` text NOT NULL,
	`best_attempt_id` text NOT NULL,
	`result_consent_at` text NOT NULL,
	`marketing_consent_at` text,
	`ranking_consent_at` text,
	`consent_version` text DEFAULT 'neurofitness-2026-09' NOT NULL,
	`source_event` text DEFAULT 'CCM' NOT NULL,
	`whatsapp_delivery_status` text DEFAULT 'PENDING' NOT NULL,
	`whatsapp_attempt_id` text,
	`whatsapp_message_id` text,
	`whatsapp_delivery_error` text,
	`whatsapp_delivered_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_neurofitness_participants_campaign_phone` ON `neurofitness_participants` (`campaign_key`,`phone_hash`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_neurofitness_participants_best_attempt` ON `neurofitness_participants` (`best_attempt_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_neurofitness_participants_ranking` ON `neurofitness_participants` (`campaign_key`,`ranking_consent_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `purchase_email_outbox` (
	`payment_id` text PRIMARY KEY NOT NULL,
	`recipient` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`provider_message_id` text,
	`last_error` text,
	`sent_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_purchase_email_outbox_status_updated` ON `purchase_email_outbox` (`status`,`updated_at`);
