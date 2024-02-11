CREATE TABLE `forms_addstudentformentrymodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone_code` text NOT NULL,
	`adder_id` integer NOT NULL,
	`college_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`grade_custom` text,
	`grade` integer,
	`email` text NOT NULL,
	`phone_number` text NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`adder_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college_id`) REFERENCES `colleges_collegemodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `generations_studentmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `colleges_collegemodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`hide_from_selection` integer NOT NULL,
	`commune_id` integer,
	`normalized_name` text NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`commune_id`) REFERENCES `core_communemodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `colleges_collegeteacherrelationmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rol` text NOT NULL,
	`commits_to_participate` integer NOT NULL,
	`college_id` integer NOT NULL,
	`teacher_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`college_id`) REFERENCES `colleges_collegemodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_id`) REFERENCES `generations_teachermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_communemodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`region_id` integer,
	`normalized_name` text NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`region_id`) REFERENCES `core_regionmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_regionmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `core_scholarshipconvocatorymodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`private_label` text NOT NULL,
	`kind` text NOT NULL,
	`order` integer NOT NULL,
	`count_addings_from_date` integer,
	`count_addings_till_date` integer,
	`lessons_start_date` text,
	`lessons_end_date` text,
	`maximum_withdrawal_date` integer,
	`is_withdrawable` integer NOT NULL,
	`devf_informed_graduates` integer,
	`devf_informed_paused` integer,
	`devf_informed_resigned` integer,
	`devf_informed_studying` integer,
	`devf_informed_not_assisted` integer,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generations_desuscriptionpagevisitmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `generations_studentmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_devfbatchgroupmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`batch_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `core_devfbatchmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_devfbatchmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` text NOT NULL,
	`modified_on` text NOT NULL,
	`number` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `core_devfmodulemodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`module` text NOT NULL,
	`lesson_1_date` text,
	`lesson_2_date` text,
	`lesson_3_date` text,
	`lesson_4_date` text,
	`lesson_5_date` text,
	`lesson_6_date` text,
	`lesson_7_date` text,
	`lesson_8_date` text,
	`number_of_lessons` integer,
	`batch_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `core_devfbatchmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_devfmoduleprogressmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_1_assistance` text,
	`lesson_2_assistance` text,
	`lesson_3_assistance` text,
	`lesson_4_assistance` text,
	`lesson_5_assistance` text,
	`lesson_6_assistance` text,
	`lesson_7_assistance` text,
	`lesson_8_assistance` text,
	`number_of_assitances` integer,
	`module_id` integer NOT NULL,
	`scholarship_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`module_id`) REFERENCES `core_devfmodulemodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scholarship_id`) REFERENCES `core_scholarshipmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations_organizationmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `core_platzicoursemodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` text NOT NULL,
	`modified_on` text NOT NULL,
	`title` text NOT NULL,
	`platzi_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `core_platzicourseprogressmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`approval_date` text,
	`status` text NOT NULL,
	`progress` text NOT NULL,
	`minutes_of_study` text NOT NULL,
	`course_id` integer NOT NULL,
	`scholarship_id` integer NOT NULL,
	`last_study_date` text,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `core_platzicoursemodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scholarship_id`) REFERENCES `core_scholarshipmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_scholarshipstatushistorymodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`observations` text,
	`scholarship_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`scholarship_id`) REFERENCES `core_scholarshipmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_scholarshipmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`convocatory_id` integer NOT NULL,
	`postulation_id` integer,
	`user_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`resign_date` integer,
	`resign_influences` text,
	`resign_reasons` text,
	`resigned` integer NOT NULL,
	`asked_to_renew` integer NOT NULL,
	`asked_to_renew_date` integer,
	`current_status_id` integer,
	`devf_batch_group_id` integer,
	`devf_added_artificially` integer NOT NULL,
	`platzi_completed_mandatory_courses` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`convocatory_id`) REFERENCES `core_scholarshipconvocatorymodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`postulation_id`) REFERENCES `core_postulationsubmissionmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `generations_studentmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_status_id`) REFERENCES `core_scholarshipstatushistorymodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`devf_batch_group_id`) REFERENCES `core_devfbatchgroupmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_postulationsubmissionfieldanswermodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`value` text,
	`field_id` integer NOT NULL,
	`submission_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `core_formfieldmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submission_id`) REFERENCES `core_postulationsubmissionmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_postulationsubmissionhistorymodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`observations` text,
	`submission_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `core_postulationsubmissionmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_postulationsubmissionmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accepted_terms` integer,
	`terms_acceptance_date` integer,
	`form_id` integer NOT NULL,
	`student_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`uuid` text NOT NULL,
	`current_status_id` integer,
	`result_notification_via_email_status` text DEFAULT 'not_sent' NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `core_formmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `generations_studentmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_status_id`) REFERENCES `core_postulationsubmissionhistorymodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_formfieldoptionmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`field_id` integer NOT NULL,
	`automatic_result` text,
	`automatic_result_observations` text,
	`order` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`field_id`) REFERENCES `core_formfieldmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_formfieldmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`is_required` integer NOT NULL,
	`is_important` integer NOT NULL,
	`min_length` integer,
	`max_length` integer,
	`form_id` integer NOT NULL,
	`depends_on_field_option_id` integer,
	`order` integer NOT NULL,
	`depends_on_field_id` integer,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`form_id`) REFERENCES `core_formmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_field_option_id`) REFERENCES `core_formfieldoptionmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`depends_on_field_id`) REFERENCES `core_formfieldmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_formmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`open_date` integer,
	`close_date` integer,
	`results_publication_date` integer,
	`convocatory_id` integer,
	`uuid` text NOT NULL,
	`terms_acceptance_close_date` integer,
	`terms_acceptance_open_date` integer,
	`results_status` text DEFAULT 'not_scheduled' NOT NULL,
	`version` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`convocatory_id`) REFERENCES `core_scholarshipconvocatorymodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_formvisitmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`student_id` integer,
	`user_id` integer,
	`form_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `generations_studentmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`form_id`) REFERENCES `core_formmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logger_servicerequest` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`started_at` text,
	`finished_at` text,
	`service` text NOT NULL,
	`status` text NOT NULL,
	`url` text NOT NULL,
	`headers` text NOT NULL,
	`data` text,
	`method` text NOT NULL,
	`response` text
);
--> statement-breakpoint
CREATE TABLE `core_talkinscriptionmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`join_url` text,
	`assisted` integer,
	`assistance_datetime` integer,
	`talk_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`talk_id`) REFERENCES `core_talkmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `core_talkmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`internal_label` text,
	`speakers` text NOT NULL,
	`zoom_api_key` text,
	`zoom_api_secret` text,
	`zoom_id` text,
	`convocatory_id` integer NOT NULL,
	`for_organization_id` integer,
	`is_visible` integer NOT NULL,
	`zoom_register_url` text,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`convocatory_id`) REFERENCES `core_scholarshipconvocatorymodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`for_organization_id`) REFERENCES `organizations_organizationmodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `generations_administratormodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` integer NOT NULL,
	`modified_on` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `generations_boardmembermodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` integer NOT NULL,
	`modified_on` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `generations_interestedmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` integer NOT NULL,
	`modified_on` integer NOT NULL,
	`rol` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `generations_studentmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`allows_whatsapp` integer,
	`discord_link_was_clicked` integer NOT NULL,
	`discord_link_click_date` integer,
	`nationality` text,
	`observations` text,
	`user_id` integer NOT NULL,
	`specialization` text,
	`completed_profile` integer NOT NULL,
	`already_created_by_signup` integer NOT NULL,
	`signup_datetime` integer,
	`college_id` integer,
	`organization_id` integer,
	`expects_to_do_next_year` integer,
	`gender` integer,
	`grade` integer,
	`time_it_takes_to_school` integer,
	`will_take_paes_test` integer,
	`is_student` integer NOT NULL,
	`uuid` text NOT NULL,
	`has_unsuscribed` integer NOT NULL,
	`unsubscription_date` integer,
	`unsubscription_reason` integer,
	`unsubscription_text` text,
	`convocatory_id` integer,
	`commune_id` integer,
	`for_aylin` integer NOT NULL,
	`aylin_called` integer NOT NULL,
	`aylin_called_date` integer,
	`has_clicked_whatsapp_link` integer NOT NULL,
	`whatsapp_link_click_date` integer,
	`note` text,
	`initiated_session_with_phone_token` integer NOT NULL,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`college_id`) REFERENCES `colleges_collegemodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations_organizationmodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`convocatory_id`) REFERENCES `core_scholarshipconvocatorymodel`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`commune_id`) REFERENCES `core_communemodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `generations_teachermodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_on` integer NOT NULL,
	`modified_on` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users_usermodel`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users_usermodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sub` text,
	`email` text NOT NULL,
	`date_joined` integer NOT NULL,
	`first_name` text NOT NULL,
	`normalized_first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`normalized_last_name` text NOT NULL,
	`phone_code` text,
	`phone_number` text,
	`whatsapp_status` integer DEFAULT 1 NOT NULL,
	`birthdate` integer,
	`isSuperAdmin` integer DEFAULT false,
	`isStudent` integer DEFAULT false,
	`isTeacher` integer DEFAULT false,
	`isAdmin` integer DEFAULT false,
	`isBoardMember` integer DEFAULT false,
	`isInterested` integer DEFAULT false,
	`emailVerified` integer DEFAULT false,
	`imageUrl` text,
	`username` text(64),
	`twoFactorEnabled` integer,
	`unsafeMetadata` blob,
	`publicMetadata` blob
);
--> statement-breakpoint
CREATE TABLE `generations_visitstologinwithphonetokenmodel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_token` text,
	`page` text,
	`created_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`modified_on` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `forms_addstudentformentrymodel_student_id_0062b555` ON `forms_addstudentformentrymodel` (`student_id`);--> statement-breakpoint
CREATE INDEX `forms_addstudentformentrymodel_college_id_72ba4f5e` ON `forms_addstudentformentrymodel` (`college_id`);--> statement-breakpoint
CREATE INDEX `forms_addstudentformentrymodel_adder_id_2dd6f1bc` ON `forms_addstudentformentrymodel` (`adder_id`);--> statement-breakpoint
CREATE INDEX `colleges_collegemodel_commune_id_cd2d946a` ON `colleges_collegemodel` (`commune_id`);--> statement-breakpoint
CREATE INDEX `colleges_collegeteacherrelationmodel_teacher_id_3f726492` ON `colleges_collegeteacherrelationmodel` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `colleges_collegeteacherrelationmodel_college_id_2a559090` ON `colleges_collegeteacherrelationmodel` (`college_id`);--> statement-breakpoint
CREATE INDEX `core_communemodel_normalized_name_52bac174` ON `core_communemodel` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `core_communemodel_region_id_e6a2af19` ON `core_communemodel` (`region_id`);--> statement-breakpoint
CREATE INDEX `core_regionmodel_normalized_name_3c55d64d` ON `core_regionmodel` (`normalized_name`);--> statement-breakpoint
CREATE INDEX `generations_desuscriptionpagevisitmodel_student_id_b0278bba` ON `generations_desuscriptionpagevisitmodel` (`student_id`);--> statement-breakpoint
CREATE INDEX `core_devfbatchgroupmodel_batch_id_7a5fd97f` ON `core_devfbatchgroupmodel` (`batch_id`);--> statement-breakpoint
CREATE INDEX `core_devfmodulemodel_batch_id_640693ba` ON `core_devfmodulemodel` (`batch_id`);--> statement-breakpoint
CREATE INDEX `core_devfmoduleprogressmodel_scholarship_id_94a731b4` ON `core_devfmoduleprogressmodel` (`scholarship_id`);--> statement-breakpoint
CREATE INDEX `core_devfmoduleprogressmodel_module_id_586e8de5` ON `core_devfmoduleprogressmodel` (`module_id`);--> statement-breakpoint
CREATE INDEX `core_platzicourseprogressmodel_scholarship_id_a5920d76` ON `core_platzicourseprogressmodel` (`scholarship_id`);--> statement-breakpoint
CREATE INDEX `core_platzicourseprogressmodel_course_id_d929b079` ON `core_platzicourseprogressmodel` (`course_id`);--> statement-breakpoint
CREATE INDEX `core_scholarshipstatushistorymodel_scholarship_id_75f41d42` ON `core_scholarshipstatushistorymodel` (`scholarship_id`);--> statement-breakpoint
CREATE INDEX `core_scholarshipmodel_devf_batch_group_id_1f2c78b1` ON `core_scholarshipmodel` (`devf_batch_group_id`);--> statement-breakpoint
CREATE INDEX `core_scholarshipmodel_current_status_id_9fe97f52` ON `core_scholarshipmodel` (`current_status_id`);--> statement-breakpoint
CREATE INDEX `core_scholarshipmodel_student_id_7a021eb0` ON `core_scholarshipmodel` (`student_id`);--> statement-breakpoint
CREATE INDEX `core_scholarshipmodel_convocatory_id_73f0a61d` ON `core_scholarshipmodel` (`convocatory_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionfieldanswermodel_submission_id_10289f0d` ON `core_postulationsubmissionfieldanswermodel` (`submission_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionfieldanswermodel_field_id_a01e8d40` ON `core_postulationsubmissionfieldanswermodel` (`field_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionhistorymodel_submission_id_73c13a61` ON `core_postulationsubmissionhistorymodel` (`submission_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionmodel_current_status_id_997c8931` ON `core_postulationsubmissionmodel` (`current_status_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionmodel_student_id_29bed689` ON `core_postulationsubmissionmodel` (`student_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionmodel_form_id_8e600ec8` ON `core_postulationsubmissionmodel` (`form_id`);--> statement-breakpoint
CREATE INDEX `core_postulationsubmissionmodel_user_id_ffb7ddf7` ON `core_postulationsubmissionmodel` (`user_id`);--> statement-breakpoint
CREATE INDEX `core_formfieldoptionmodel_field_id_4508fc4e` ON `core_formfieldoptionmodel` (`field_id`);--> statement-breakpoint
CREATE INDEX `core_formfieldmodel_depends_on_field_id_62866e09` ON `core_formfieldmodel` (`depends_on_field_id`);--> statement-breakpoint
CREATE INDEX `core_formfieldmodel_depends_on_field_option_id_2ccb974b` ON `core_formfieldmodel` (`depends_on_field_option_id`);--> statement-breakpoint
CREATE INDEX `core_formfieldmodel_form_id_8c637f82` ON `core_formfieldmodel` (`form_id`);--> statement-breakpoint
CREATE INDEX `core_formmodel_close_date_59ae3e3a` ON `core_formmodel` (`close_date`);--> statement-breakpoint
CREATE INDEX `core_formmodel_open_date_4b2c8ccb` ON `core_formmodel` (`open_date`);--> statement-breakpoint
CREATE INDEX `core_postulationformvisitmodel_form_id_6f5cee4f` ON `core_formvisitmodel` (`form_id`);--> statement-breakpoint
CREATE INDEX `core_postulationformvisitmodel_student_id_d7cf78c8` ON `core_formvisitmodel` (`student_id`);--> statement-breakpoint
CREATE INDEX `core_talkinscriptionmodel_user_id_16b884f3` ON `core_talkinscriptionmodel` (`user_id`);--> statement-breakpoint
CREATE INDEX `core_talkinscriptionmodel_talk_id_d3256188` ON `core_talkinscriptionmodel` (`talk_id`);--> statement-breakpoint
CREATE INDEX `core_talkmodel_for_organization_id_bab7d394` ON `core_talkmodel` (`for_organization_id`);--> statement-breakpoint
CREATE INDEX `core_talkmodel_convocatory_id_b454430c` ON `core_talkmodel` (`convocatory_id`);--> statement-breakpoint
CREATE INDEX `core_talkmodel_uuid` ON `core_talkmodel` (`uuid`);--> statement-breakpoint
CREATE INDEX `generations_studentmodel_for_aylin_28f8020a` ON `generations_studentmodel` (`for_aylin`);--> statement-breakpoint
CREATE INDEX `generations_studentmodel_commune_id_44b86f28` ON `generations_studentmodel` (`commune_id`);--> statement-breakpoint
CREATE INDEX `generations_studentmodel_convocatory_id_d53fede2` ON `generations_studentmodel` (`convocatory_id`);--> statement-breakpoint
CREATE INDEX `generations_studentmodel_organization_id_3b14b638` ON `generations_studentmodel` (`organization_id`);--> statement-breakpoint
CREATE INDEX `generations_studentmodel_college_id_c6a46e3c` ON `generations_studentmodel` (`college_id`);--> statement-breakpoint
CREATE INDEX `users_usermodel_date_joined_f5deb65b` ON `users_usermodel` (`date_joined`);--> statement-breakpoint
CREATE INDEX `users_normalized_first_name_index` ON `users_usermodel` (`normalized_first_name`);--> statement-breakpoint
CREATE INDEX `users_normalized_last_name_index` ON `users_usermodel` (`normalized_last_name`);--> statement-breakpoint
CREATE INDEX `users_email_index` ON `users_usermodel` (`email`);