import {
    pgTable,
    integer,
    index,
    text,
    serial,
    boolean,
    date,
    PgColumn,
} from 'drizzle-orm/pg-core';
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

export const applicationTable = pgTable(
    'core_postulationsubmissionmodel',
    {
        id: serial('id').primaryKey(),
        acceptedTerms: boolean('accepted_terms'),
        termsAcceptanceDate: date('terms_acceptance_date', { mode: 'date' }),
        formId: integer('form_id')
            .notNull()
            .references(() => formTable.id, {
                onDelete: 'cascade',
            }),
        studentId: integer('student_id')
            .notNull()
            .references(() => studentProfileTable.id, {
                onDelete: 'cascade',
            }),
        userId: integer('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        uuid: text('uuid').notNull(),
        currentStatusId: integer('current_status_id').references(
            () => applicationHistoryTable.id,
            {
                onDelete: 'cascade',
            },
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

export const applicationFieldAnswerTable = pgTable(
    'core_postulationsubmissionfieldanswermodel',
    {
        id: serial('id').primaryKey(),
        value: text('value'),
        fieldId: integer('field_id')
            .notNull()
            .references(() => formFieldTable.id, {
                onDelete: 'cascade',
            }),
        submissionId: integer('submission_id')
            .notNull()
            .references(() => applicationTable.id, {
                onDelete: 'cascade',
            }),
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

export const applicationHistoryTable = pgTable(
    'core_postulationsubmissionhistorymodel',
    {
        id: serial('id').primaryKey(),
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
        submissionId: integer('submission_id')
            .notNull()
            .references((): PgColumn => applicationTable.id, {
                onDelete: 'cascade',
            }),
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
