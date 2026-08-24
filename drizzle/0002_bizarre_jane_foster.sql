CREATE TABLE `whatsapp_events` (
	`provider_message_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `attachment_url` text;--> statement-breakpoint
ALTER TABLE `trainings` ADD `resource_url` text;