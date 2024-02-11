import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export enum ScholarshipConvocatoryKind {
    PLATZI = 'Platzi',
    DEVF = 'Dev.F',
}

export const convocatoryTable = sqliteTable('core_scholarshipconvocatorymodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    privateLabel: text('private_label').notNull(),

    kind: text('kind', {
        enum: [ScholarshipConvocatoryKind.DEVF, ScholarshipConvocatoryKind.PLATZI],
    }).notNull(),

    order: int('order').notNull(),

    countAddingsFromDate: int('count_addings_from_date', {
        mode: 'timestamp',
    }),
    countAddingsTillDate: int('count_addings_till_date', {
        mode: 'timestamp',
    }),

    lessonsStartDate: text('lessons_start_date'),
    lessonsEndDate: text('lessons_end_date'),

    maximumWithdrawalDate: int('maximum_withdrawal_date', {
        mode: 'timestamp',
    }),

    isWithdrawable: int('is_withdrawable', {
        mode: 'boolean',
    }).notNull(),

    devfInformedGraduates: int('devf_informed_graduates'),
    devfInformedPaused: int('devf_informed_paused'),
    devfInformedResigned: int('devf_informed_resigned'),
    devfInformedStudying: int('devf_informed_studying'),
    devfInformedNotAssisted: int('devf_informed_not_assisted'),

    ...TIMESTAMP_FIELDS,
});

export const selectConvocatorySchema = createSelectSchema(convocatoryTable);
export type SelectConvocatorySchema = z.infer<typeof selectConvocatorySchema>;

export const insertConvocatorySchema = createInsertSchema(convocatoryTable);
