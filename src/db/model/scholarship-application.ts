import { sqliteTable, int, index, AnySQLiteColumn, text } from 'drizzle-orm/sqlite-core';
import { formFieldTable, formTable } from './scholarship-form';
import { studentProfileTable, userTable } from './user';
import { ApplicationStatus, TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export enum ApplicationEmailResultNotificationStatus {
    NOT_SENT = 'not_sent',
    SENT = 'sent',
    FAILED = 'failed',
}

export const applicationTable = sqliteTable(
    'core_postulationsubmissionmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        acceptedTerms: int('accepted_terms', {
            mode: 'boolean',
        }),
        termsAcceptanceDate: int('terms_acceptance_date', {
            mode: 'timestamp',
        }),
        formId: int('form_id')
            .notNull()
            .references(() => formTable.id),
        studentId: int('student_id')
            .notNull()
            .references(() => studentProfileTable.id),
        userId: int('user_id')
            .notNull()
            .references(() => userTable.id),
        uuid: text('uuid').notNull(),
        currentStatusId: int('current_status_id').references(
            () => applicationHistoryTable.id,
        ),
        resultNotificationViaEmailStatus: text('result_notification_via_email_status', {
            enum: [
                ApplicationEmailResultNotificationStatus.NOT_SENT,
                ApplicationEmailResultNotificationStatus.SENT,
                ApplicationEmailResultNotificationStatus.FAILED,
            ],
        })
            .notNull()
            .default(ApplicationEmailResultNotificationStatus.NOT_SENT),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            currentStatusId997C8931: index(
                'core_postulationsubmissionmodel_current_status_id_997c8931',
            ).on(table.currentStatusId),
            studentId29Bed689: index(
                'core_postulationsubmissionmodel_student_id_29bed689',
            ).on(table.studentId),
            formId8E600Ec8: index('core_postulationsubmissionmodel_form_id_8e600ec8').on(
                table.formId,
            ),
            userIdFfB7DdF7: index('core_postulationsubmissionmodel_user_id_ffb7ddf7').on(
                table.userId,
            ),
        };
    },
);

export const applicationFieldAnswerTable = sqliteTable(
    'core_postulationsubmissionfieldanswermodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        value: text('value'),
        fieldId: int('field_id')
            .notNull()
            .references(() => formFieldTable.id),
        submissionId: int('submission_id')
            .notNull()
            .references(() => applicationTable.id),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            submissionId10289F0D: index(
                'core_postulationsubmissionfieldanswermodel_submission_id_10289f0d',
            ).on(table.submissionId),
            fieldIdA01E8D40: index(
                'core_postulationsubmissionfieldanswermodel_field_id_a01e8d40',
            ).on(table.fieldId),
        };
    },
);

export const applicationHistoryTable = sqliteTable(
    'core_postulationsubmissionhistorymodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        status: text('status', {
            enum: [
                ApplicationStatus.SUBMITTED,
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.DECLINED,
                ApplicationStatus.PENDING,
                ApplicationStatus.DECLINED_TERMS,
                ApplicationStatus.ACCEPTED_TERMS,
                ApplicationStatus.TERMS_UNANSWERED,
            ],
        }).notNull(),
        observations: text('observations'),
        submissionId: int('submission_id')
            .notNull()
            .references((): AnySQLiteColumn => applicationTable.id),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            submissionId73C13A61: index(
                'core_postulationsubmissionhistorymodel_submission_id_73c13a61',
            ).on(table.submissionId),
        };
    },
);

export const selectApplicationSchema = createSelectSchema(applicationTable);
export type SelectApplicationSchema = z.infer<typeof selectApplicationSchema>;

export const insertApplicationSchema = createInsertSchema(applicationTable);
export type InsertApplicationSchema = z.infer<typeof insertApplicationSchema>;

export const selectApplicationHistorySchema = createSelectSchema(applicationHistoryTable);
export type SelectApplicationHistorySchema = z.infer<
    typeof selectApplicationHistorySchema
>;

export const insertApplicationHistorySchema = createInsertSchema(applicationHistoryTable);
export type InsertApplicationHistorySchema = z.infer<
    typeof insertApplicationHistorySchema
>;

export const selectApplicationFieldAnswerSchema = createSelectSchema(
    applicationFieldAnswerTable,
);
export type SelectApplicationFieldAnswerSchema = z.infer<
    typeof selectApplicationFieldAnswerSchema
>;

export const insertApplicationFieldAnswerSchema = createInsertSchema(
    applicationFieldAnswerTable,
);
export type InsertApplicationFieldAnswerSchema = z.infer<
    typeof insertApplicationFieldAnswerSchema
>;
