CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_slug_unique` ON `series` (`slug`);--> statement-breakpoint
ALTER TABLE `blog-db` ADD `series_id` integer REFERENCES series(id);--> statement-breakpoint
ALTER TABLE `blog-db` ADD `series_order` integer;