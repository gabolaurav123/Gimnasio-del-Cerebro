ALTER TABLE `neurofitness_attempts` ADD `whatsapp_delivery_status` text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE `neurofitness_attempts` ADD `whatsapp_delivery_started_at` text;--> statement-breakpoint
ALTER TABLE `neurofitness_attempts` ADD `whatsapp_message_id` text;--> statement-breakpoint
ALTER TABLE `neurofitness_attempts` ADD `whatsapp_delivery_error` text;--> statement-breakpoint
ALTER TABLE `neurofitness_attempts` ADD `whatsapp_delivered_at` text;