import { pgTable, integer, text, index, serial } from 'drizzle-orm/pg-core';
import { userTable } from './user';
import { collegeTable } from './college';
import { studentProfileTable } from './user';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const addStudentFormEntryTable = pgTable(
    'forms_addstudentformentrymodel',
    {
        id: serial('id').primaryKey(),
        firstName: text('first_name').notNull(),
        lastName: text('last_name').notNull(),
        phoneCode: text('phone_code').notNull(),
        adderId: integer('adder_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        collegeId: integer('college_id')
            .notNull()
            .references(() => collegeTable.id, {
                onDelete: 'cascade',
            }),
        userId: integer('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        studentId: integer('student_id')
            .notNull()
            .references(() => studentProfileTable.id, {
                onDelete: 'cascade',
            }),
        gradeCustom: text('grade_custom'),
        grade: integer('grade'),
        email: text('email').notNull(),
        phoneNumber: text('phone_number').notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            studentId0062B555: index(
                'forms_addstudentformentrymodel_student_id_0062b555',
            ).on(table.studentId),
            collegeId72Ba4F5E: index(
                'forms_addstudentformentrymodel_college_id_72ba4f5e',
            ).on(table.collegeId),
            adderId2Dd6F1Bc: index('forms_addstudentformentrymodel_adder_id_2dd6f1bc').on(
                table.adderId,
            ),
        };
    },
);
