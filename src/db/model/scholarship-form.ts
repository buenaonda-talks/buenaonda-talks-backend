import {
    pgTable,
    index,
    text,
    integer,
    boolean,
    timestamp,
    serial,
    PgColumn,
} from 'drizzle-orm/pg-core';
import { studentProfileTable, userTable } from './user';
import { convocatoryTable } from './convocatory';
import { ApplicationStatus, TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

export enum FormResultsStatus {
    NOT_SCHEDULED = 'not_scheduled',
    SCHEDULED = 'scheduled',
    RUNNING = 'running',
    FINISHED = 'finished',
}

export const formTable = pgTable(
    'core_formmodel',
    {
        id: serial('id').primaryKey(),
        title: text('title').notNull(),
        openDate: timestamp('open_date'),
        closeDate: timestamp('close_date'),
        resultsPublicationDate: timestamp('results_publication_date'),
        convocatoryId: integer('convocatory_id').references(() => convocatoryTable.id, {
            onDelete: 'cascade',
        }),
        uuid: text('uuid').notNull(),
        termsAcceptanceCloseDate: timestamp('terms_acceptance_close_date'),
        termsAcceptanceOpenDate: timestamp('terms_acceptance_open_date'),
        resultsStatus: text('results_status', {
            enum: [
                FormResultsStatus.NOT_SCHEDULED,
                FormResultsStatus.SCHEDULED,
                FormResultsStatus.RUNNING,
                FormResultsStatus.FINISHED,
            ],
        })
            .notNull()
            .default(FormResultsStatus.NOT_SCHEDULED),
        version: integer('version').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            closeDate59Ae3E3A: index('core_formmodel_close_date_59ae3e3a').on(
                table.closeDate,
            ),
            openDate4B2C8Ccb: index('core_formmodel_open_date_4b2c8ccb').on(
                table.openDate,
            ),
        };
    },
);

export const formRelations = relations(formTable, ({ many, one }) => {
    return {
        field: many(formFieldTable),
        convocatory: one(convocatoryTable, {
            fields: [formTable.convocatoryId],
            references: [convocatoryTable.id],
        }),
        visitLog: many(formVisitLogTable),
    };
});

export enum FormFieldType {
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    RADIO_BOX = 'RADIO_BOX',
    FIRST_NAME = 'FIRST_NAME',
    LAST_NAME = 'LAST_NAME',
    COLLEGE = 'COLLEGE',
}

export const formFieldTable = pgTable(
    'core_formfieldmodel',
    {
        id: serial('id').primaryKey(),
        title: text('title').notNull(),
        description: text('description'),
        type: text('type', {
            enum: [
                FormFieldType.TEXT,
                FormFieldType.TEXTAREA,
                FormFieldType.RADIO_BOX,
                FormFieldType.FIRST_NAME,
                FormFieldType.LAST_NAME,
                FormFieldType.COLLEGE,
            ],
        }).notNull(),
        isRequired: boolean('is_required').notNull(),
        isImportant: boolean('is_important').notNull(),
        minLength: integer('min_length'),
        maxLength: integer('max_length'),
        formId: integer('form_id')
            .notNull()
            .references(() => formTable.id, {
                onDelete: 'cascade',
            }),
        dependsOnFieldOptionId: integer('depends_on_field_option_id').references(
            (): PgColumn => formFieldOptionTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        order: integer('order').notNull(),
        dependsOnFieldId: integer('depends_on_field_id'),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            dependsOnFieldId62866E09: index(
                'core_formfieldmodel_depends_on_field_id_62866e09',
            ).on(table.dependsOnFieldId),
            dependsOnFieldOptionId2Ccb974B: index(
                'core_formfieldmodel_depends_on_field_option_id_2ccb974b',
            ).on(table.dependsOnFieldOptionId),
            formId8C637F82: index('core_formfieldmodel_form_id_8c637f82').on(
                table.formId,
            ),
        };
    },
);

export const formFieldRelations = relations(formFieldTable, ({ many, one }) => {
    return {
        form: one(formTable, {
            fields: [formFieldTable.id],
            references: [formTable.id],
        }),
        option: many(formFieldOptionTable),
        dependsOnField: one(formFieldTable, {
            fields: [formFieldTable.dependsOnFieldId],
            references: [formFieldTable.id],
        }),
        dependsOnFieldOption: one(formFieldOptionTable, {
            fields: [formFieldTable.dependsOnFieldOptionId],
            references: [formFieldOptionTable.id],
        }),
    };
});

export const formFieldOptionTable = pgTable(
    'core_formfieldoptionmodel',
    {
        id: serial('id').primaryKey(),
        label: text('label').notNull(),
        fieldId: integer('field_id')
            .notNull()
            .references((): PgColumn => formFieldTable.id, {
                onDelete: 'cascade',
            }),
        automaticResult: text('automatic_result', {
            enum: [
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.DECLINED,
                ApplicationStatus.PENDING,
            ],
        }),
        automaticResultObservations: text('automatic_result_observations'),
        order: integer('order').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            fieldId4508Fc4E: index('core_formfieldoptionmodel_field_id_4508fc4e').on(
                table.fieldId,
            ),
        };
    },
);

export const formFieldOptionRelations = relations(formFieldOptionTable, ({ one }) => {
    return {
        field: one(formFieldTable, {
            fields: [formFieldOptionTable.fieldId],
            references: [formFieldTable.id],
        }),
    };
});

export const formVisitLogTable = pgTable(
    'core_formvisitmodel',
    {
        id: serial('id').primaryKey(),
        studentId: integer('student_id').references(() => studentProfileTable.id, {
            onDelete: 'cascade',
        }),
        userId: integer('user_id').references(() => userTable.id, {
            onDelete: 'cascade',
        }),
        formId: integer('form_id')
            .notNull()
            .references(() => formTable.id, {
                onDelete: 'cascade',
            }),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            corePostulationformvisitmodelFormId6F5Cee4F: index(
                'core_postulationformvisitmodel_form_id_6f5cee4f',
            ).on(table.formId),
            corePostulationformvisitmodelStudentIdD7Cf78C8: index(
                'core_postulationformvisitmodel_student_id_d7cf78c8',
            ).on(table.studentId),
        };
    },
);

export const selectFormSchema = createSelectSchema(formTable);
export type SelectFormSchema = z.infer<typeof selectFormSchema>;

export const insertFormSchema = createInsertSchema(formTable);
export type InsertFormSchema = z.infer<typeof insertFormSchema>;

export const selectFormFieldSchema = createSelectSchema(formFieldTable);
export type SelectFormFieldSchema = z.infer<typeof selectFormFieldSchema>;

export const insertFormFieldSchema = createInsertSchema(formFieldTable);
export type InsertFormFieldSchema = z.infer<typeof insertFormFieldSchema>;

export const selectFormFieldOptionSchema = createSelectSchema(formFieldOptionTable);
export type SelectFormFieldOptionSchema = z.infer<typeof selectFormFieldOptionSchema>;

export const insertFormFieldOptionSchema = createInsertSchema(formFieldOptionTable);
export type InsertFormFieldOptionSchema = z.infer<typeof insertFormFieldOptionSchema>;

export const selectFormVisitLogSchema = createSelectSchema(formVisitLogTable);
export const insertFormVisitLogSchema = createInsertSchema(formVisitLogTable);
