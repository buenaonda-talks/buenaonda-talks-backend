import { collegeTable } from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';
import { eq } from 'drizzle-orm';
import { ApiError, ApiErrorRef } from '../api-error/ref';
import { CollegeRepository } from '@/db/repository/college';
import { CollegeRef } from './ref';

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

export const CollegeInputRef = schemaBuilder.inputType('CollegeInput', {
    fields: (t) => ({
        name: t.string({
            required: true,
        }),
        communeId: t.int({
            required: true,
        }),
    }),
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
                .then((res) => res[0]);

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
    createCollege: t.field({
        type: CollegeRef,
        args: {
            input: t.arg({
                type: CollegeInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { input }, { DB }) => {
            const newCollege = await CollegeRepository.create({
                DB,
                name: input.name,
                communeId: input.communeId,
            });

            return newCollege;
        },
    }),
    updateCollege: t.field({
        type: CollegeRef,
        args: {
            id: t.arg.int({
                required: true,
            }),
            input: t.arg({
                type: CollegeInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { id, input }, { DB }) => {
            const exists = await CollegeRepository.exists({
                DB,
                id,
            });

            if (!exists) {
                throw new Error('College does not exist');
            }

            const newCollege = await DB.update(collegeTable)
                .set({
                    name: input.name,
                    communeId: input.communeId,
                })
                .where(eq(collegeTable.id, id))
                .returning()
                .then((res) => res[0]);

            return newCollege;
        },
    }),
    mergeColleges: t.field({
        type: 'Boolean',
        args: {
            sourceCollegeId: t.arg.int({
                required: true,
            }),
            targetCollegeId: t.arg.int({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { sourceCollegeId, targetCollegeId }, { DB }) => {
            if (sourceCollegeId === targetCollegeId) {
                throw new Error('sourceCollegeId and targetCollegeId must be different');
            }

            if (!(await CollegeRepository.exists({ DB, id: sourceCollegeId }))) {
                throw new Error('sourceCollegeId does not exist');
            }

            if (!(await CollegeRepository.exists({ DB, id: targetCollegeId }))) {
                throw new Error('targetCollegeId does not exist');
            }

            await CollegeRepository.merge({
                DB,
                sourceCollegeId,
                targetCollegeId,
            });

            return true;
        },
    }),
}));
