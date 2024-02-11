import { sqliteTable, int, text, index } from 'drizzle-orm/sqlite-core';
import { scholarshipTable } from './scholarship';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const platziCourseTable = sqliteTable('core_platzicoursemodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: text('created_on').notNull(),
    modifiedOn: text('modified_on').notNull(),
    title: text('title').notNull(),
    platziId: text('platzi_id').notNull(),
});

export const scholarshipPlatziCourseProgressTable = sqliteTable(
    'core_platzicourseprogressmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        approvalDate: text('approval_date'),
        status: text('status').notNull(),
        progress: text('progress').notNull(),
        minutesOfStudy: text('minutes_of_study').notNull(),
        courseId: int('course_id')
            .notNull()
            .references(() => platziCourseTable.id),
        scholarshipId: int('scholarship_id')
            .notNull()
            .references(() => scholarshipTable.id),
        lastStudyDate: text('last_study_date'),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            scholarshipIdA5920D76: index(
                'core_platzicourseprogressmodel_scholarship_id_a5920d76',
            ).on(table.scholarshipId),
            courseIdD929B079: index(
                'core_platzicourseprogressmodel_course_id_d929b079',
            ).on(table.courseId),
        };
    },
);
