import {
    sqliteTable,
    index,
    foreignKey,
    text,
    int,
    AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';
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

export const formTable = sqliteTable(
    'core_formmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        title: text('title').notNull(),
        openDate: int('open_date', {
            mode: 'timestamp_ms',
        }),
        closeDate: int('close_date', {
            mode: 'timestamp_ms',
        }),
        resultsPublicationDate: int('results_publication_date', {
            mode: 'timestamp_ms',
        }),
        convocatoryId: int('convocatory_id').references(() => convocatoryTable.id),
        uuid: text('uuid').notNull(),
        termsAcceptanceCloseDate: int('terms_acceptance_close_date', {
            mode: 'timestamp_ms',
        }),
        termsAcceptanceOpenDate: int('terms_acceptance_open_date', {
            mode: 'timestamp_ms',
        }),
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
        version: int('version').notNull(),
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

export const formFieldTable = sqliteTable(
    'core_formfieldmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
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
        isRequired: int('is_required', {
            mode: 'boolean',
        }).notNull(),
        isImportant: int('is_important', {
            mode: 'boolean',
        }).notNull(),
        minLength: int('min_length'),
        maxLength: int('max_length'),
        formId: int('form_id')
            .notNull()
            .references(() => formTable.id),
        dependsOnFieldOptionId: int('depends_on_field_option_id').references(
            (): AnySQLiteColumn => formFieldOptionTable.id,
        ),
        order: int('order').notNull(),
        dependsOnFieldId: int('depends_on_field_id'),
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
            coreFormfieldmodeldependsOnFieldIdCoreFormfieldmodelIdFk: foreignKey(() => ({
                columns: [table.dependsOnFieldId],
                foreignColumns: [table.id],
                name: 'core_formfieldmodel_depends_on_field_id_core_formfieldmodel_id_fk',
            })),
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

export const formFieldOptionTable = sqliteTable(
    'core_formfieldoptionmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        label: text('label').notNull(),
        fieldId: int('field_id')
            .notNull()
            .references((): AnySQLiteColumn => formFieldTable.id),
        automaticResult: text('automatic_result', {
            enum: [
                ApplicationStatus.ACCEPTED,
                ApplicationStatus.DECLINED,
                ApplicationStatus.PENDING,
            ],
        }),
        automaticResultObservations: text('automatic_result_observations'),
        order: int('order', {
            mode: 'number',
        }).notNull(),
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

export const formVisitLogTable = sqliteTable(
    'core_formvisitmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        studentId: int('student_id').references(() => studentProfileTable.id),
        userId: int('user_id').references(() => userTable.id),
        formId: int('form_id')
            .notNull()
            .references(() => formTable.id),
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
