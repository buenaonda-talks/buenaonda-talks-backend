import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const visitsToLoginWithPhoneTokenTable = sqliteTable(
    'generations_visitstologinwithphonetokenmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        phoneToken: text('phone_token'),
        page: text('page'),
        ...TIMESTAMP_FIELDS,
    },
);
