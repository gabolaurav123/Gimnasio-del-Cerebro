CREATE INDEX `idx_blog_posts_status_published_at` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_activities_contact_id` ON `contact_activities` (`contact_id`);--> statement-breakpoint
CREATE INDEX `idx_contacts_status_created_at` ON `contacts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contacts_training_interest` ON `contacts` (`training_interest`);--> statement-breakpoint
CREATE INDEX `idx_trainings_status_order` ON `trainings` (`status`,`display_order`);