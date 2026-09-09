CREATE TABLE `system_secrets` (
	`key` text PRIMARY KEY NOT NULL,
	`encrypted_value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `appointment_blocks` ADD `recurrence` text DEFAULT 'DATE' NOT NULL;--> statement-breakpoint
ALTER TABLE `appointment_blocks` ADD `weekday` integer;--> statement-breakpoint
ALTER TABLE `appointment_blocks` ADD `end_date` text;--> statement-breakpoint
CREATE INDEX `idx_appointment_blocks_recurrence_active` ON `appointment_blocks` (`recurrence`,`weekday`,`active`);--> statement-breakpoint
ALTER TABLE `events` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;