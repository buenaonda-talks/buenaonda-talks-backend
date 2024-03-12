import { pgTable, text, serial } from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';

export const visitsToLoginWithPhoneTokenTable = pgTable(
    'generations_visitstologinwithphonetokenmodel',
    {
        id: serial('id').primaryKey(),
        phoneToken: text('phone_token'),
        page: text('page'),
        ...TIMESTAMP_FIELDS,
    },
);
