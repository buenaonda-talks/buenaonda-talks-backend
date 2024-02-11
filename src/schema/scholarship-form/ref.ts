import {
    SelectFormFieldSchema,
    SelectFormSchema,
    selectFormFieldSchema,
    SelectFormFieldOptionSchema,
    selectFormFieldOptionSchema,
    FormFieldType,
    FormResultsStatus,
} from '@/db/model/scholarship-form';

import { selectConvocatorySchema } from '@/db/model/convocatory';
import { ConvocatoryRef } from '../convocatory/ref';

import { schemaBuilder } from '@/schema/schema-builder';
import { ApplicationStatus } from '@/db/shared';
import { ApplicationRef } from '../scholarship-application';
import { selectApplicationSchema } from '@/db/drizzle-schema';

export const ApplicationStatusRef = schemaBuilder.enumType(ApplicationStatus, {
    name: 'ApplicationStatus',
});

export const FormFieldTypeRef = schemaBuilder.enumType(FormFieldType, {
    name: 'FormFieldType',
});

export const FormResultsStatusRef = schemaBuilder.enumType(FormResultsStatus, {
    name: 'FormResultsStatus',
});

export const FormFieldOptionRef =
    schemaBuilder.objectRef<SelectFormFieldOptionSchema>('FormFieldOption');
schemaBuilder.objectType(FormFieldOptionRef, {
    description: 'Representation of a scholarship form field option',
    fields: (t) => ({
        id: t.exposeID('id'),

        label: t.exposeString('label'),

        automaticResult: t.field({
            type: ApplicationStatusRef,
            nullable: true,
            resolve: (root) => root.automaticResult,
        }),

        automaticResultObservations: t.exposeString('automaticResultObservations', {
            nullable: true,
        }),

        order: t.exposeInt('order'),

        field: t.field({
            type: FormFieldRef,
            resolve: async (root, args, { DB }) => {
                const field = await DB.query.formFieldTable.findFirst({
                    where: (etc, { eq }) => eq(etc.id, root.fieldId),
                });

                return selectFormFieldSchema.parse(field);
            },
        }),
    }),
});

export const FormFieldRef = schemaBuilder.objectRef<SelectFormFieldSchema>('FormField');
schemaBuilder.objectType(FormFieldRef, {
    description: 'Representation of a scholarship form field',
    fields: (t) => ({
        id: t.exposeID('id'),

        title: t.exposeString('title'),
        description: t.exposeString('description', { nullable: true }),

        type: t.field({
            type: FormFieldTypeRef,
            resolve: (root) => root.type,
        }),

        isRequired: t.exposeBoolean('isRequired'),

        isImportant: t.exposeBoolean('isImportant'),

        minLength: t.exposeInt('minLength', { nullable: true }),

        maxLength: t.exposeInt('maxLength', { nullable: true }),

        dependsOnFieldId: t.exposeID('dependsOnFieldId', { nullable: true }),
        dependsOnFieldOptionId: t.exposeID('dependsOnFieldOptionId', { nullable: true }),

        order: t.exposeInt('order'),

        options: t.field({
            type: [FormFieldOptionRef],
            resolve: async (root, args, { DB }) => {
                const options = await DB.query.formFieldOptionTable.findMany({
                    where: (etc, { eq }) => eq(etc.fieldId, root.id),
                    orderBy(fields, operators) {
                        return operators.asc(fields.order);
                    },
                });

                return options.map((o) => selectFormFieldOptionSchema.parse(o));
            },
        }),
    }),
});

export const FormRef = schemaBuilder.objectRef<SelectFormSchema>('Form');
schemaBuilder.objectType(FormRef, {
    description: 'Representation of a scholarship form',
    fields: (t) => ({
        id: t.exposeID('id'),

        title: t.exposeString('title'),
        uuid: t.exposeString('uuid'),

        openDate: t.field({
            type: 'DateTime',
            nullable: true,
            resolve: (form) => form.openDate,
        }),

        closeDate: t.field({
            type: 'DateTime',
            nullable: true,
            resolve: (form) => form.closeDate,
        }),

        resultsPublicationDate: t.field({
            type: 'DateTime',
            nullable: true,
            resolve: (form) => form.resultsPublicationDate,
        }),

        termsAcceptanceOpenDate: t.field({
            type: 'DateTime',
            nullable: true,
            resolve: (form) => form.termsAcceptanceOpenDate,
        }),

        termsAcceptanceCloseDate: t.field({
            type: 'DateTime',
            nullable: true,
            resolve: (form) => form.termsAcceptanceCloseDate,
        }),

        resultsStatus: t.exposeString('resultsStatus'),

        version: t.exposeInt('version'),

        convocatory: t.field({
            type: ConvocatoryRef,
            nullable: true,
            resolve: async (root, args, { DB }) => {
                const { convocatoryId } = root;
                if (!convocatoryId) {
                    return null;
                }

                const convocatory = await DB.query.convocatoryTable.findFirst({
                    where: (etc, { eq }) => eq(etc.id, convocatoryId),
                });

                return selectConvocatorySchema.parse(convocatory);
            },
        }),

        fields: t.field({
            type: [FormFieldRef],
            resolve: async (root, args, { DB }) => {
                const fields = await DB.query.formFieldTable.findMany({
                    where: (etc, { eq }) => eq(etc.formId, root.id),
                    orderBy(fields, operators) {
                        return operators.asc(fields.order);
                    },
                });

                return fields.map((f) => selectFormFieldSchema.parse(f));
            },
        }),

        myApplication: t.field({
            type: ApplicationRef,
            nullable: true,
            resolve: async (root, args, { DB, STUDENT }) => {
                if (!STUDENT) {
                    return null;
                }

                const application = await DB.query.applicationTable.findFirst({
                    where: (etc, { eq, and }) => {
                        return and(
                            eq(etc.formId, root.id),
                            eq(etc.studentId, STUDENT.id),
                        );
                    },
                });

                if (!application) {
                    return null;
                }

                return selectApplicationSchema.parse(application);
            },
        }),
    }),
});
