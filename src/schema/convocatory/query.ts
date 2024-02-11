import { schemaBuilder } from '@/schema/schema-builder';
import { ConvocatoryRef } from './ref';
import { selectConvocatorySchema } from '@/db/drizzle-schema';

schemaBuilder.queryFields((t) => ({
    convocatories: t.field({
        type: [ConvocatoryRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.convocatoryTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.order);
                },
            });

            return results.map((u) => selectConvocatorySchema.parse(u));
        },
    }),
    convocatoryById: t.field({
        type: ConvocatoryRef,
        nullable: true,
        args: {
            id: t.arg.int({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { id }, { DB }) => {
            const result = await DB.query.convocatoryTable.findFirst({
                where: (fields, operators) => {
                    return operators.eq(fields.id, id);
                },
            });

            if (!result) {
                return null;
            }

            return selectConvocatorySchema.parse(result);
        },
    }),
}));
