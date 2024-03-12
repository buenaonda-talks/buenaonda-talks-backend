ALTER TABLE generations_teachermodel ADD `is_verified` integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE generations_teachermodel ADD `has_signed_up` integer NOT NULL DEFAULT 1;--> statement-breakpoint
CREATE INDEX `core_talkmodel_start_date` ON `core_talkmodel` (`start_date`);--> statement-breakpoint
CREATE INDEX `core_talkmodel_end_date` ON `core_talkmodel` (`end_date`);