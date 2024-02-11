import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const organizationTable = sqliteTable('organizations_organizationmodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    name: text('name').notNull(),
    ...TIMESTAMP_FIELDS,
});

export const selectOrganizationSchema = createSelectSchema(organizationTable);
export type SelectOrganizationSchema = z.infer<typeof selectOrganizationSchema>;
