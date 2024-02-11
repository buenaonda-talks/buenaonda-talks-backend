import { sqliteTable, index, int } from 'drizzle-orm/sqlite-core';
import { studentProfileTable, userTable } from './user';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const desuscriptionVisitLog = sqliteTable(
    'generations_desuscriptionpagevisitmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        userId: int('user_id')
            .notNull()
            .references(() => userTable.id),
        studentId: int('student_id')
            .notNull()
            .references(() => studentProfileTable.id),
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
