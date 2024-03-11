import { collegeTable } from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';
import { eq } from 'drizzle-orm';
import { ApiError, ApiErrorRef } from '../api-error/ref';

class DeleteCollegeSuccess {
    id: number;

    constructor({ id }: { id: number }) {
        this.id = id;
    }
}

const DeleteCollegeSuccessRef = schemaBuilder.objectType(DeleteCollegeSuccess, {
    name: 'DeleteCollegeSuccess',
    description: 'The link to assist to a talk',
    fields: (t) => ({
        id: t.exposeInt('id', {
            description: 'The ID of the deleted college',
        }),
    }),
});

const DeleteCollegeRef = schemaBuilder.unionType('DeleteCollege', {
    types: [DeleteCollegeSuccessRef, ApiErrorRef],
    resolveType: (parent) => {
        if (parent instanceof ApiError) {
            return ApiErrorRef;
        }

        return DeleteCollegeSuccessRef;
    },
});

schemaBuilder.mutationFields((t) => ({
    deleteCollege: t.field({
        type: DeleteCollegeRef,
        args: {
            id: t.arg({
                type: 'Int',
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { id }, { DB }) => {
            const result = await DB.delete(collegeTable)
                .where(eq(collegeTable.id, id))
                .returning()
                .get();

            if (!result) {
                return new ApiError({
                    code: 'NOT_FOUND',
                    message: 'No se encontró la convocatoria',
                });
            }

            return new DeleteCollegeSuccess({
                id: result.id,
            });
        },
    }),
}));
