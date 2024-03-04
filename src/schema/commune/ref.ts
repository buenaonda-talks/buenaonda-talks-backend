import {
    SelectRegionSchema,
    SelectCommuneSchema,
    selectCommuneSchema,
} from '@/db/drizzle-schema';

import { schemaBuilder } from '@/schema/schema-builder';

export const RegionRef = schemaBuilder.objectRef<SelectRegionSchema>('Region');

schemaBuilder.objectType(RegionRef, {
    description: 'Representation of a region',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        communes: t.field({
            type: [CommuneRef],
            resolve: async (parent, _args, { DB }) => {
                const results = await DB.query.communeTable.findMany({
                    where: (field, { eq }) => eq(field.regionId, parent.id),
                    orderBy(fields, operators) {
                        return operators.desc(fields.id);
                    },
                });

                return results.map((u) => selectCommuneSchema.parse(u));
            },
        }),
    }),
});

export const CommuneRef = schemaBuilder.objectRef<SelectCommuneSchema>('Commune');

schemaBuilder.objectType(CommuneRef, {
    description: 'Representation of a commune',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        regionId: t.exposeID('regionId'),
    }),
});
