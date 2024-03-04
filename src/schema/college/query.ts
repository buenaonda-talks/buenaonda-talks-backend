import { schemaBuilder } from '../schema-builder';
import { CollegeRef } from './ref';
import { selectCollegeSchema } from '@/db/drizzle-schema';

schemaBuilder.queryFields((t) => ({
    colleges: t.field({
        type: [CollegeRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.collegeTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCollegeSchema.parse(u));
        },
    }),

    collegesByCommune: t.field({
        type: [CollegeRef],
        authz: {
            rules: ['IsAuthenticated'],
        },
        args: {
            communeId: t.arg.int({
                required: true,
            }),
        },
        resolve: async (parent, { communeId }, { DB }) => {
            const results = await DB.query.collegeTable.findMany({
                where: (field, { eq }) => eq(field.communeId, communeId),
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCollegeSchema.parse(u));
        },
    }),
}));
