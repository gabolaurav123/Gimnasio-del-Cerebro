CREATE TABLE `payment_webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`status` text DEFAULT 'PROCESSING' NOT NULL,
	`payload_hash` text,
	`error` text,
	`processed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payment_webhook_events_provider_event` ON `payment_webhook_events` (`provider`,`event_id`);--> statement-breakpoint
ALTER TABLE `products` ADD `checkout_external_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_products_provider_external_unique` ON `products` (`checkout_provider`,`checkout_external_id`) WHERE checkout_external_id IS NOT NULL;--> statement-breakpoint
ALTER TABLE `trainings` ADD `checkout_external_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_trainings_provider_external_unique` ON `trainings` (`checkout_provider`,`checkout_external_id`) WHERE checkout_external_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_payments_provider_reference` ON `payments` (`source`,`provider_reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payments_source_provider_reference_unique` ON `payments` (`source`,`provider_reference`) WHERE provider_reference IS NOT NULL;