PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`property_id` text,
	`data` text NOT NULL,
	FOREIGN KEY (`property_id`,`owner_id`) REFERENCES `properties`(`id`,`owner_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_reminders`("id", "owner_id", "property_id", "data") SELECT "id", "owner_id", "property_id", "data" FROM `reminders`;--> statement-breakpoint
DROP TABLE `reminders`;--> statement-breakpoint
ALTER TABLE `__new_reminders` RENAME TO `reminders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `reminders_owner_property` ON `reminders` (`owner_id`,`property_id`);