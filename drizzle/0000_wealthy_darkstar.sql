CREATE TABLE `cash_flow_items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`property_id` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`,`owner_id`) REFERENCES `properties`(`id`,`owner_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cash_flow_owner_property` ON `cash_flow_items` (`owner_id`,`property_id`);--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `properties_owner_status` ON `properties` (`owner_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `property_owner_key` ON `properties` (`id`,`owner_id`);