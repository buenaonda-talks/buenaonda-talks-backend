import { schemaBuilder } from '@/schema/schema-builder';
import { FormRef } from './ref';
import { selectFormSchema } from '@/db/model/scholarship-form';
import { ApiError } from '../api-error/ref';

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
        resolve: async (parent, { uuid }, { DB, STUDENT }) => {
            const result = await DB.query.formTable.findFirst({
                where: (etc, { eq }) => {
                    return eq(etc.uuid, uuid);
                },
            });

            if (!result) {
                return null;
            }

            const now = new Date();
            if (STUDENT) {
                if (!result.openDate || !result.closeDate) {
                    throw new ApiError({
                        code: 'FORM_NOT_AVAILABLE',
                        message: 'El formulario no está disponible',
                    });
                }

                if (result.openDate > now) {
                    throw new ApiError({
                        code: 'FORM_NOT_OPEN_YET',
                        message: 'El formulario aún no está disponible',
                    });
                }

                if (result.closeDate < now) {
                    throw new ApiError({
                        code: 'FORM_CLOSED',
                        message: 'El formulario ya no está disponible',
                    });
                }
            }

            return selectFormSchema.parse(result);
        },
    }),
}));
