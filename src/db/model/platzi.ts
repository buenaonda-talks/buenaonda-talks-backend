import { pgTable, integer, text, index, serial } from 'drizzle-orm/pg-core';
import { scholarshipTable } from './scholarship';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const platziCourseTable = pgTable('core_platzicoursemodel', {
    id: serial('id').primaryKey(),
    createdOn: text('created_on').notNull(),
    modifiedOn: text('modified_on').notNull(),
    title: text('title').notNull(),
    platziId: text('platzi_id').notNull(),
});

export const scholarshipPlatziCourseProgressTable = pgTable(
    'core_platzicourseprogressmodel',
    {
        id: serial('id').primaryKey(),
        approvalDate: text('approval_date'),
        status: text('status').notNull(),
        progress: text('progress').notNull(),
        minutesOfStudy: text('minutes_of_study').notNull(),
        courseId: integer('course_id')
            .notNull()
            .references(() => platziCourseTable.id, {
                onDelete: 'cascade',
            }),
        scholarshipId: integer('scholarship_id')
            .notNull()
            .references(() => scholarshipTable.id, {
                onDelete: 'cascade',
            }),
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
