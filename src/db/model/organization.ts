import { pgTable, text, serial } from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const organizationTable = pgTable('organizations_organizationmodel', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    ...TIMESTAMP_FIELDS,
});

export const selectOrganizationSchema = createSelectSchema(organizationTable);
export type SelectOrganizationSchema = z.infer<typeof selectOrganizationSchema>;
