import { pgTable, integer, text, serial, date, boolean } from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export enum ScholarshipConvocatoryKind {
    PLATZI = 'Platzi',
    DEVF = 'Dev.F',
}

export const convocatoryTable = pgTable('core_scholarshipconvocatorymodel', {
    id: serial('id').primaryKey(),
    privateLabel: text('private_label').notNull(),

    kind: text('kind', {
        enum: [ScholarshipConvocatoryKind.DEVF, ScholarshipConvocatoryKind.PLATZI],
    }).notNull(),

    order: integer('order').notNull(),

    countAddingsFromDate: date('count_addings_from_date', { mode: 'date' }),
    countAddingsTillDate: date('count_addings_till_date', { mode: 'date' }),

    lessonsStartDate: text('lessons_start_date'),
    lessonsEndDate: text('lessons_end_date'),

    maximumWithdrawalDate: date('maximum_withdrawal_date', { mode: 'date' }),

    isWithdrawable: boolean('is_withdrawable').notNull(),

    devfInformedGraduates: integer('devf_informed_graduates'),
    devfInformedPaused: integer('devf_informed_paused'),
    devfInformedResigned: integer('devf_informed_resigned'),
    devfInformedStudying: integer('devf_informed_studying'),
    devfInformedNotAssisted: integer('devf_informed_not_assisted'),

    ...TIMESTAMP_FIELDS,
});

export const selectConvocatorySchema = createSelectSchema(convocatoryTable);
export type SelectConvocatorySchema = z.infer<typeof selectConvocatorySchema>;

export const insertConvocatorySchema = createInsertSchema(convocatoryTable);
