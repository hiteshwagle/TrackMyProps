CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`property_id` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`property_id`,`owner_id`) REFERENCES `properties`(`id`,`owner_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reminders_owner_property` ON `reminders` (`owner_id`,`property_id`);