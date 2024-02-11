import { schemaBuilder } from '../schema-builder';
import { OrganizationRef } from './ref';
import { selectOrganizationSchema } from '@/db/drizzle-schema';

schemaBuilder.queryFields((t) => ({
    organizations: t.field({
        type: [OrganizationRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.organizationTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectOrganizationSchema.parse(u));
        },
    }),
}));
