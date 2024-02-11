import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { communeTable } from './commune';
import { teacherProfileTable } from './user';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const collegeTable = sqliteTable(
    'colleges_collegemodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        name: text('name').notNull(),
        hideFromSelection: int('hide_from_selection', {
            mode: 'boolean',
        }).notNull(),
        communeId: int('commune_id').references(() => communeTable.id),
        normalizedName: text('normalized_name').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            communeIdCd2D946A: index('colleges_collegemodel_commune_id_cd2d946a').on(
                table.communeId,
            ),
        };
    },
);

export const collegesCollegeteacherrelationmodel = sqliteTable(
    'colleges_collegeteacherrelationmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        rol: text('rol').notNull(),
        commitsToParticipate: int('commits_to_participate', {
            mode: 'boolean',
        }).notNull(),
        collegeId: int('college_id')
            .notNull()
            .references(() => collegeTable.id),
        teacherId: int('teacher_id')
            .notNull()
            .references(() => teacherProfileTable.id),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            teacherId3F726492: index(
                'colleges_collegeteacherrelationmodel_teacher_id_3f726492',
            ).on(table.teacherId),
            collegeId2A559090: index(
                'colleges_collegeteacherrelationmodel_college_id_2a559090',
            ).on(table.collegeId),
        };
    },
);

export const selectCollegeSchema = createSelectSchema(collegeTable);
export type SelectCollegeSchema = z.infer<typeof selectCollegeSchema>;

export const selectCollegeTeacherRelationSchema = createSelectSchema(
    collegesCollegeteacherrelationmodel,
);
export type SelectCollegeTeacherRelationSchema = z.infer<
    typeof selectCollegeTeacherRelationSchema
>;
