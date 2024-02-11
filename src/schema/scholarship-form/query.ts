import { schemaBuilder } from '@/schema/schema-builder';
import { FormRef } from './ref';
import { selectFormSchema } from '@/db/model/scholarship-form';

schemaBuilder.queryFields((t) => ({
    forms: t.field({
        type: [FormRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.formTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.openDate);
                },
            });

            return results.map((u) => selectFormSchema.parse(u));
        },
    }),
    formByUUID: t.field({
        type: FormRef,
        nullable: true,
        args: {
            uuid: t.arg({
                type: 'String',
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated'],
        },
        resolve: async (parent, { uuid }, { DB }) => {
            const result = await DB.query.formTable.findFirst({
                where: (etc, { eq }) => {
                    return eq(etc.uuid, uuid);
                },
            });

            if (!result) {
                return null;
            }

            // const now = new Date();
            // if (STUDENT) {
            //     if (!result.openDate || !result.closeDate) {
            //         throw new Error('El formulario aún no está disponible');
            //     }

            //     if (result.openDate > now) {
            //         throw new Error('El formulario aún no acepta respuestas');
            //     }

            //     if (result.closeDate < now) {
            //         throw new Error('El formulario ya no acepta respuestas');
            //     }
            // }

            return selectFormSchema.parse(result);
        },
    }),
}));
