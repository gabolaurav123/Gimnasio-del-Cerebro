CREATE TABLE `whatsapp_auth_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`encrypted_value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `whatsapp_auth_keys` (
	`category` text NOT NULL,
	`key_id` text NOT NULL,
	`encrypted_value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_whatsapp_auth_keys_unique` ON `whatsapp_auth_keys` (`category`,`key_id`);--> statement-breakpoint
CREATE TABLE `whatsapp_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`jid` text NOT NULL,
	`phone_number` text NOT NULL,
	`contact_name` text DEFAULT 'Contacto' NOT NULL,
	`mode` text DEFAULT 'AI' NOT NULL,
	`product_interest` text,
	`last_message` text DEFAULT '' NOT NULL,
	`last_message_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`unread_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `whatsapp_conversations_jid_unique` ON `whatsapp_conversations` (`jid`);--> statement-breakpoint
CREATE INDEX `idx_whatsapp_conversations_updated` ON `whatsapp_conversations` (`last_message_at`);--> statement-breakpoint
CREATE INDEX `idx_whatsapp_conversations_mode` ON `whatsapp_conversations` (`mode`);--> statement-breakpoint
CREATE TABLE `whatsapp_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`provider_message_id` text,
	`direction` text NOT NULL,
	`sender_type` text NOT NULL,
	`content` text NOT NULL,
	`delivery_status` text DEFAULT 'SENT' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `whatsapp_messages_provider_message_id_unique` ON `whatsapp_messages` (`provider_message_id`);--> statement-breakpoint
CREATE INDEX `idx_whatsapp_messages_conversation` ON `whatsapp_messages` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `whatsapp_session_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`phone_number` text,
	`account_name` text,
	`last_connected_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
