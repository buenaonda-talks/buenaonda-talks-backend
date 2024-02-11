import { schemaBuilder } from '@/schema/schema-builder';
import { convocatoryTable, insertConvocatorySchema } from '@/db/drizzle-schema';
import { ConvocatoryRef, ScholarshipConvocatoryKindRef } from './ref';
import { eq } from 'drizzle-orm';

const ConvocatoryInputRef = schemaBuilder.inputType('ConvocatoryInput', {
    fields: (t) => ({
        privateLabel: t.string({
            required: true,
        }),
        kind: t.field({
            type: ScholarshipConvocatoryKindRef,
            required: true,
        }),
        order: t.int({
            required: true,
        }),
        countAddingsFromDate: t.field({
            type: 'Date',
            required: false,
        }),
        countAddingsTillDate: t.field({
            type: 'Date',
            required: false,
        }),
        lessonsStartDate: t.field({
            type: 'Date',
            required: false,
        }),
        lessonsEndDate: t.field({
            type: 'Date',
            required: false,
        }),
        maximumWithdrawalDate: t.field({
            type: 'Date',
            required: false,
        }),
        isWithdrawable: t.boolean({
            required: true,
        }),
        devfInformedGraduates: t.int({
            required: false,
        }),
        devfInformedPaused: t.int({
            required: false,
        }),
        devfInformedResigned: t.int({
            required: false,
        }),
        devfInformedStudying: t.int({
            required: false,
        }),
        devfInformedNotAssisted: t.int({
            required: false,
        }),
    }),
});

schemaBuilder.mutationFields((t) => ({
    createConvocatory: t.field({
        type: ConvocatoryRef,
        args: {
            input: t.arg({
                type: ConvocatoryInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { input }, { DB }) => {
            const values = insertConvocatorySchema.parse(input);
            const convocatory = await DB.insert(convocatoryTable)
                .values(values)
                .returning()
                .get();

            return convocatory;
        },
    }),
    updateConvocatory: t.field({
        type: ConvocatoryRef,
        args: {
            id: t.arg({
                type: 'Int',
                required: true,
            }),
            input: t.arg({
                type: ConvocatoryInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, { id, input }, { DB }) => {
            const values = insertConvocatorySchema.parse(input);
            const convocatory = await DB.update(convocatoryTable)
                .set(values)
                .where(eq(convocatoryTable.id, id))
                .returning()
                .get();

            return convocatory;
        },
    }),
    deleteConvocatory: t.field({
        type: 'Int',
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
            const result = await DB.delete(convocatoryTable)
                .where(eq(convocatoryTable.id, id))
                .returning()
                .get();

            if (!result) {
                throw new Error(`No se encontró la convocatoria con el id ${id}`);
            }

            return result.id;
        },
    }),
}));
