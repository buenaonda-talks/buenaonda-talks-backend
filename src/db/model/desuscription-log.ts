import { pgTable, index, integer, serial } from 'drizzle-orm/pg-core';
import { studentProfileTable, userTable } from './user';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const desuscriptionVisitLog = pgTable(
    'generations_desuscriptionpagevisitmodel',
    {
        id: serial('id').primaryKey(),
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
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            studentIdB0278Bba: index(
                'generations_desuscriptionpagevisitmodel_student_id_b0278bba',
            ).on(table.studentId),
        };
    },
);
