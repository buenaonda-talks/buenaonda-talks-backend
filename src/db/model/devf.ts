import { pgTable, integer, text, index, serial } from 'drizzle-orm/pg-core';
import { scholarshipTable } from './scholarship';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const devfBatchTable = pgTable('core_devfbatchmodel', {
    id: serial('id').primaryKey(),
    createdOn: text('created_on').notNull(),
    modifiedOn: text('modified_on').notNull(),
    number: integer('number').notNull(),
});

export const devfModuleTable = pgTable(
    'core_devfmodulemodel',
    {
        id: serial('id').primaryKey(),
        module: text('module').notNull(),
        lesson1Date: text('lesson_1_date'),
        lesson2Date: text('lesson_2_date'),
        lesson3Date: text('lesson_3_date'),
        lesson4Date: text('lesson_4_date'),
        lesson5Date: text('lesson_5_date'),
        lesson6Date: text('lesson_6_date'),
        lesson7Date: text('lesson_7_date'),
        lesson8Date: text('lesson_8_date'),
        numberOfLessons: integer('number_of_lessons'),
        batchId: integer('batch_id')
            .notNull()
            .references(() => devfBatchTable.id, {
                onDelete: 'cascade',
            }),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            batchId640693Ba: index('core_devfmodulemodel_batch_id_640693ba').on(
                table.batchId,
            ),
        };
    },
);

export const devfBatchGroupTable = pgTable(
    'core_devfbatchgroupmodel',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        batchId: integer('batch_id')
            .notNull()
            .references(() => devfBatchTable.id, {
                onDelete: 'cascade',
            }),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            batchId7A5Fd97F: index('core_devfbatchgroupmodel_batch_id_7a5fd97f').on(
                table.batchId,
            ),
        };
    },
);

export const scholarshipDevfModuleProgressTable = pgTable(
    'core_devfmoduleprogressmodel',
    {
        id: serial('id').primaryKey(),
        lesson1Assistance: text('lesson_1_assistance'),
        lesson2Assistance: text('lesson_2_assistance'),
        lesson3Assistance: text('lesson_3_assistance'),
        lesson4Assistance: text('lesson_4_assistance'),
        lesson5Assistance: text('lesson_5_assistance'),
        lesson6Assistance: text('lesson_6_assistance'),
        lesson7Assistance: text('lesson_7_assistance'),
        lesson8Assistance: text('lesson_8_assistance'),
        numberOfAssitances: integer('number_of_assitances'),
        moduleId: integer('module_id')
            .notNull()
            .references(() => devfModuleTable.id, {
                onDelete: 'cascade',
            }),
        scholarshipId: integer('scholarship_id')
            .notNull()
            .references(() => scholarshipTable.id, {
                onDelete: 'cascade',
            }),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            scholarshipId94A731B4: index(
                'core_devfmoduleprogressmodel_scholarship_id_94a731b4',
            ).on(table.scholarshipId),
            moduleId586E8De5: index('core_devfmoduleprogressmodel_module_id_586e8de5').on(
                table.moduleId,
            ),
        };
    },
);
