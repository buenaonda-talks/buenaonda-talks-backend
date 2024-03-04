import { schemaBuilder } from '@/schema/schema-builder';

import { CommuneRef, RegionRef } from './ref';
import { selectCommuneSchema, selectRegionSchema } from '@/db/drizzle-schema';

schemaBuilder.queryFields((t) => ({
    communes: t.field({
        type: [CommuneRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.communeTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCommuneSchema.parse(u));
        },
    }),
    communesByRegion: t.field({
        type: [CommuneRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            regionId: t.arg.int({
                required: true,
            }),
        },
        resolve: async (parent, { regionId }, { DB }) => {
            const results = await DB.query.communeTable.findMany({
                where: (field, { eq }) => eq(field.regionId, regionId),
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCommuneSchema.parse(u));
        },
    }),
    regions: t.field({
        type: [RegionRef],
        authz: {
            rules: ['IsAuthenticated'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.regionTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectRegionSchema.parse(u));
        },
    }),
}));
