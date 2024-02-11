import { sqliteTable, int, text, index } from 'drizzle-orm/sqlite-core';
import { scholarshipTable } from './scholarship';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const devfBatchTable = sqliteTable('core_devfbatchmodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: text('created_on').notNull(),
    modifiedOn: text('modified_on').notNull(),
    number: int('number').notNull(),
});

export const devfModuleTable = sqliteTable(
    'core_devfmodulemodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        module: text('module').notNull(),
        lesson1Date: text('lesson_1_date'),
        lesson2Date: text('lesson_2_date'),
        lesson3Date: text('lesson_3_date'),
        lesson4Date: text('lesson_4_date'),
        lesson5Date: text('lesson_5_date'),
        lesson6Date: text('lesson_6_date'),
        lesson7Date: text('lesson_7_date'),
        lesson8Date: text('lesson_8_date'),
        numberOfLessons: int('number_of_lessons'),
        batchId: int('batch_id')
            .notNull()
            .references(() => devfBatchTable.id),
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

export const devfBatchGroupTable = sqliteTable(
    'core_devfbatchgroupmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        name: text('name').notNull(),
        batchId: int('batch_id')
            .notNull()
            .references(() => devfBatchTable.id),
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

export const scholarshipDevfModuleProgressTable = sqliteTable(
    'core_devfmoduleprogressmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        lesson1Assistance: text('lesson_1_assistance'),
        lesson2Assistance: text('lesson_2_assistance'),
        lesson3Assistance: text('lesson_3_assistance'),
        lesson4Assistance: text('lesson_4_assistance'),
        lesson5Assistance: text('lesson_5_assistance'),
        lesson6Assistance: text('lesson_6_assistance'),
        lesson7Assistance: text('lesson_7_assistance'),
        lesson8Assistance: text('lesson_8_assistance'),
        numberOfAssitances: int('number_of_assitances'),
        moduleId: int('module_id')
            .notNull()
            .references(() => devfModuleTable.id),
        scholarshipId: int('scholarship_id')
            .notNull()
            .references(() => scholarshipTable.id),
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
