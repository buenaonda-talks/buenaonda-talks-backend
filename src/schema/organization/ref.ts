import { SelectOrganizationSchema } from '@/db/drizzle-schema';

import { schemaBuilder } from '@/schema/schema-builder';

export const OrganizationRef =
    schemaBuilder.objectRef<SelectOrganizationSchema>('Organization');
schemaBuilder.objectType(OrganizationRef, {
    description: 'Representation of an organization',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
    }),
});
