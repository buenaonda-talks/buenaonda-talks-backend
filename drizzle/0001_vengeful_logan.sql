DO $$ BEGIN
 ALTER TABLE "forms_addstudentformentrymodel" ADD CONSTRAINT "forms_addstudentformentrymodel_adder_id_users_usermodel_id_fk" FOREIGN KEY ("adder_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forms_addstudentformentrymodel" ADD CONSTRAINT "forms_addstudentformentrymodel_college_id_colleges_collegemodel_id_fk" FOREIGN KEY ("college_id") REFERENCES "colleges_collegemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forms_addstudentformentrymodel" ADD CONSTRAINT "forms_addstudentformentrymodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forms_addstudentformentrymodel" ADD CONSTRAINT "forms_addstudentformentrymodel_student_id_generations_studentmodel_id_fk" FOREIGN KEY ("student_id") REFERENCES "generations_studentmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colleges_collegeteacherrelationmodel" ADD CONSTRAINT "colleges_collegeteacherrelationmodel_college_id_colleges_collegemodel_id_fk" FOREIGN KEY ("college_id") REFERENCES "colleges_collegemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colleges_collegeteacherrelationmodel" ADD CONSTRAINT "colleges_collegeteacherrelationmodel_teacher_id_generations_teachermodel_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "generations_teachermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colleges_collegemodel" ADD CONSTRAINT "colleges_collegemodel_commune_id_core_communemodel_id_fk" FOREIGN KEY ("commune_id") REFERENCES "core_communemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_communemodel" ADD CONSTRAINT "core_communemodel_region_id_core_regionmodel_id_fk" FOREIGN KEY ("region_id") REFERENCES "core_regionmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_desuscriptionpagevisitmodel" ADD CONSTRAINT "generations_desuscriptionpagevisitmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_desuscriptionpagevisitmodel" ADD CONSTRAINT "generations_desuscriptionpagevisitmodel_student_id_generations_studentmodel_id_fk" FOREIGN KEY ("student_id") REFERENCES "generations_studentmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_devfbatchgroupmodel" ADD CONSTRAINT "core_devfbatchgroupmodel_batch_id_core_devfbatchmodel_id_fk" FOREIGN KEY ("batch_id") REFERENCES "core_devfbatchmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_devfmodulemodel" ADD CONSTRAINT "core_devfmodulemodel_batch_id_core_devfbatchmodel_id_fk" FOREIGN KEY ("batch_id") REFERENCES "core_devfbatchmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_devfmoduleprogressmodel" ADD CONSTRAINT "core_devfmoduleprogressmodel_module_id_core_devfmodulemodel_id_fk" FOREIGN KEY ("module_id") REFERENCES "core_devfmodulemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_devfmoduleprogressmodel" ADD CONSTRAINT "core_devfmoduleprogressmodel_scholarship_id_core_scholarshipmodel_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "core_scholarshipmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_platzicourseprogressmodel" ADD CONSTRAINT "core_platzicourseprogressmodel_course_id_core_platzicoursemodel_id_fk" FOREIGN KEY ("course_id") REFERENCES "core_platzicoursemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_platzicourseprogressmodel" ADD CONSTRAINT "core_platzicourseprogressmodel_scholarship_id_core_scholarshipmodel_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "core_scholarshipmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipstatushistorymodel" ADD CONSTRAINT "core_scholarshipstatushistorymodel_scholarship_id_core_scholarshipmodel_id_fk" FOREIGN KEY ("scholarship_id") REFERENCES "core_scholarshipmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_convocatory_id_core_scholarshipconvocatorymodel_id_fk" FOREIGN KEY ("convocatory_id") REFERENCES "core_scholarshipconvocatorymodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_postulation_id_core_postulationsubmissionmodel_id_fk" FOREIGN KEY ("postulation_id") REFERENCES "core_postulationsubmissionmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_student_id_generations_studentmodel_id_fk" FOREIGN KEY ("student_id") REFERENCES "generations_studentmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_current_status_id_core_scholarshipstatushistorymodel_id_fk" FOREIGN KEY ("current_status_id") REFERENCES "core_scholarshipstatushistorymodel"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_scholarshipmodel" ADD CONSTRAINT "core_scholarshipmodel_devf_batch_group_id_core_devfbatchgroupmodel_id_fk" FOREIGN KEY ("devf_batch_group_id") REFERENCES "core_devfbatchgroupmodel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionfieldanswermodel" ADD CONSTRAINT "core_postulationsubmissionfieldanswermodel_field_id_core_formfieldmodel_id_fk" FOREIGN KEY ("field_id") REFERENCES "core_formfieldmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionfieldanswermodel" ADD CONSTRAINT "core_postulationsubmissionfieldanswermodel_submission_id_core_postulationsubmissionmodel_id_fk" FOREIGN KEY ("submission_id") REFERENCES "core_postulationsubmissionmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionhistorymodel" ADD CONSTRAINT "core_postulationsubmissionhistorymodel_submission_id_core_postulationsubmissionmodel_id_fk" FOREIGN KEY ("submission_id") REFERENCES "core_postulationsubmissionmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionmodel" ADD CONSTRAINT "core_postulationsubmissionmodel_form_id_core_formmodel_id_fk" FOREIGN KEY ("form_id") REFERENCES "core_formmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionmodel" ADD CONSTRAINT "core_postulationsubmissionmodel_student_id_generations_studentmodel_id_fk" FOREIGN KEY ("student_id") REFERENCES "generations_studentmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionmodel" ADD CONSTRAINT "core_postulationsubmissionmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_postulationsubmissionmodel" ADD CONSTRAINT "core_postulationsubmissionmodel_current_status_id_core_postulationsubmissionhistorymodel_id_fk" FOREIGN KEY ("current_status_id") REFERENCES "core_postulationsubmissionhistorymodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formfieldoptionmodel" ADD CONSTRAINT "core_formfieldoptionmodel_field_id_core_formfieldmodel_id_fk" FOREIGN KEY ("field_id") REFERENCES "core_formfieldmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formfieldmodel" ADD CONSTRAINT "core_formfieldmodel_form_id_core_formmodel_id_fk" FOREIGN KEY ("form_id") REFERENCES "core_formmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formfieldmodel" ADD CONSTRAINT "core_formfieldmodel_depends_on_field_option_id_core_formfieldoptionmodel_id_fk" FOREIGN KEY ("depends_on_field_option_id") REFERENCES "core_formfieldoptionmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formmodel" ADD CONSTRAINT "core_formmodel_convocatory_id_core_scholarshipconvocatorymodel_id_fk" FOREIGN KEY ("convocatory_id") REFERENCES "core_scholarshipconvocatorymodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formvisitmodel" ADD CONSTRAINT "core_formvisitmodel_student_id_generations_studentmodel_id_fk" FOREIGN KEY ("student_id") REFERENCES "generations_studentmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formvisitmodel" ADD CONSTRAINT "core_formvisitmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_formvisitmodel" ADD CONSTRAINT "core_formvisitmodel_form_id_core_formmodel_id_fk" FOREIGN KEY ("form_id") REFERENCES "core_formmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_talkinscriptionmodel" ADD CONSTRAINT "core_talkinscriptionmodel_talk_id_core_talkmodel_id_fk" FOREIGN KEY ("talk_id") REFERENCES "core_talkmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_talkinscriptionmodel" ADD CONSTRAINT "core_talkinscriptionmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_talkmodel" ADD CONSTRAINT "core_talkmodel_convocatory_id_core_scholarshipconvocatorymodel_id_fk" FOREIGN KEY ("convocatory_id") REFERENCES "core_scholarshipconvocatorymodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "core_talkmodel" ADD CONSTRAINT "core_talkmodel_for_organization_id_organizations_organizationmodel_id_fk" FOREIGN KEY ("for_organization_id") REFERENCES "organizations_organizationmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_administratormodel" ADD CONSTRAINT "generations_administratormodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_boardmembermodel" ADD CONSTRAINT "generations_boardmembermodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_interestedmodel" ADD CONSTRAINT "generations_interestedmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_studentmodel" ADD CONSTRAINT "generations_studentmodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_studentmodel" ADD CONSTRAINT "generations_studentmodel_college_id_colleges_collegemodel_id_fk" FOREIGN KEY ("college_id") REFERENCES "colleges_collegemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_studentmodel" ADD CONSTRAINT "generations_studentmodel_organization_id_organizations_organizationmodel_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations_organizationmodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_studentmodel" ADD CONSTRAINT "generations_studentmodel_convocatory_id_core_scholarshipconvocatorymodel_id_fk" FOREIGN KEY ("convocatory_id") REFERENCES "core_scholarshipconvocatorymodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_studentmodel" ADD CONSTRAINT "generations_studentmodel_commune_id_core_communemodel_id_fk" FOREIGN KEY ("commune_id") REFERENCES "core_communemodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generations_teachermodel" ADD CONSTRAINT "generations_teachermodel_user_id_users_usermodel_id_fk" FOREIGN KEY ("user_id") REFERENCES "users_usermodel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
