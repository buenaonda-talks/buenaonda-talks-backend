import { index, integer, pgTable, text, serial, boolean } from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { communeTable } from './commune';
import { teacherProfileTable } from './user';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const collegeTable = pgTable(
    'colleges_collegemodel',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        hideFromSelection: boolean('hide_from_selection').notNull(),
        communeId: integer('commune_id').references(() => communeTable.id, {
            onDelete: 'cascade',
        }),
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

export const collegeAndTeacherRelationTable = pgTable(
    'colleges_collegeteacherrelationmodel',
    {
        id: serial('id').primaryKey(),
        rol: text('rol').notNull(),
        commitsToParticipate: boolean('commits_to_participate').notNull(),
        collegeId: integer('college_id')
            .notNull()
            .references(() => collegeTable.id, {
                onDelete: 'cascade',
            }),
        teacherId: integer('teacher_id')
            .notNull()
            .references(() => teacherProfileTable.id, {
                onDelete: 'cascade',
            }),
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

export const insertCollegeSchema = createInsertSchema(collegeTable);
export type InsertCollegeSchema = z.infer<typeof insertCollegeSchema>;

export const selectCollegeTeacherRelationSchema = createSelectSchema(
    collegeAndTeacherRelationTable,
);
export type SelectCollegeTeacherRelationSchema = z.infer<
    typeof selectCollegeTeacherRelationSchema
>;

export const insertCollegeTeacherRelationSchema = createInsertSchema(
    collegeAndTeacherRelationTable,
);
export type InsertCollegeTeacherRelationSchema = z.infer<
    typeof insertCollegeTeacherRelationSchema
>;
