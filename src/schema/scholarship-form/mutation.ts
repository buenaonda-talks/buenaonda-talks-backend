import { schemaBuilder } from '@/schema/schema-builder';
import { ApplicationStatusRef, FormFieldTypeRef, FormRef } from './ref';
import {
    FormResultsStatus,
    InsertFormFieldOptionSchema,
    InsertFormFieldSchema,
    InsertFormSchema,
    SelectFormFieldOptionSchema,
    SelectFormFieldSchema,
    formFieldOptionTable,
    formFieldTable,
    formTable,
    insertFormFieldOptionSchema,
    insertFormFieldSchema,
    insertFormSchema,
} from '@/db/drizzle-schema';
import { eq } from 'drizzle-orm';
import SendApplicationStatusEmailsQueueMananger from '@/jobs/send-application-status-emails/manager';

const FormFieldOptionInputRef = schemaBuilder.inputType('FormFieldOptionInput', {
    fields: (t) => ({
        id: t.int({
            required: false,
        }),
        label: t.string({
            required: true,
        }),
        uuid: t.string({
            required: true,
        }),
        automaticResult: t.field({
            type: ApplicationStatusRef,
            required: false,
        }),
        automaticResultObservations: t.string({
            required: false,
        }),
        order: t.int({
            required: true,
        }),
    }),
});

const FormFieldInputRef = schemaBuilder.inputType('FormFieldInput', {
    fields: (t) => ({
        id: t.int({
            required: false,
        }),
        uuid: t.string({
            required: true,
        }),
        title: t.string({
            required: true,
        }),
        description: t.string({
            required: false,
        }),
        type: t.field({
            type: FormFieldTypeRef,
            required: true,
        }),
        isRequired: t.boolean({
            required: true,
        }),
        isImportant: t.boolean({
            required: true,
        }),
        minLength: t.int({
            required: false,
        }),
        maxLength: t.int({
            required: false,
        }),
        order: t.int({
            required: true,
        }),
        dependsOnFieldUUID: t.string({
            required: false,
        }),
        dependsOnFieldOptionUUID: t.string({
            required: false,
        }),
        options: t.field({
            type: [FormFieldOptionInputRef],
            required: false,
        }),
    }),
});

const FormInputRef = schemaBuilder.inputType('FormInput', {
    fields: (t) => ({
        title: t.string({
            required: true,
        }),
        openDate: t.field({
            type: 'DateTime',
            required: true,
        }),
        closeDate: t.field({
            type: 'DateTime',
            required: true,
        }),
        resultsPublicationDate: t.field({
            type: 'DateTime',
            required: false,
        }),
        convocatoryId: t.int({
            required: true,
        }),
        termsAcceptanceCloseDate: t.field({
            type: 'DateTime',
            required: false,
        }),
        termsAcceptanceOpenDate: t.field({
            type: 'DateTime',
            required: false,
        }),
        version: t.int({
            required: true,
        }),
        fields: t.field({
            type: [FormFieldInputRef],
            required: true,
        }),
    }),
});

schemaBuilder.mutationFields((t) => ({
    createForm: t.field({
        type: FormRef,
        args: {
            input: t.arg({
                type: FormInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const formToParse: InsertFormSchema = {
                uuid: crypto.randomUUID(),
                title: args.input.title,
                openDate: args.input.openDate,
                closeDate: args.input.closeDate,
                resultsPublicationDate: args.input.resultsPublicationDate,
                convocatoryId: args.input.convocatoryId,
                termsAcceptanceOpenDate: args.input.termsAcceptanceOpenDate,
                termsAcceptanceCloseDate: args.input.termsAcceptanceCloseDate,
                version: args.input.version,
                resultsStatus: FormResultsStatus.NOT_SCHEDULED,
            };
            const formParsed = insertFormSchema.parse(formToParse);
            const form = await DB.insert(formTable)
                .values(formParsed)
                .returning()
                .then((res) => res[0]);

            if (!form) {
                throw new Error('Ocurrió un error al crear el formulario');
            }

            const fieldsUUIDsToIds = new Map<string, number>();
            const optionsUUIDsToIds = new Map<string, number>();
            for (let i = 0; i < args.input.fields.length; i++) {
                const field = args.input.fields[i];

                const fieldToParse: InsertFormFieldSchema = {
                    formId: form.id,
                    title: field.title,
                    description: field.description,
                    type: field.type,
                    isRequired: field.isRequired,
                    isImportant: field.isImportant,
                    minLength: field.minLength,
                    maxLength: field.maxLength,
                    order: field.order,
                    dependsOnFieldId: field.dependsOnFieldUUID
                        ? fieldsUUIDsToIds.get(field.dependsOnFieldUUID) ?? null
                        : null,
                    dependsOnFieldOptionId: field.dependsOnFieldOptionUUID
                        ? optionsUUIDsToIds.get(field.dependsOnFieldOptionUUID) ?? null
                        : null,
                };
                const fieldParsed = insertFormFieldSchema.parse(fieldToParse);
                const insertedField = await DB.insert(formFieldTable)
                    .values(fieldParsed)
                    .returning()
                    .then((res) => res[0]);

                fieldsUUIDsToIds.set(field.uuid, insertedField.id);

                if (!field.options) {
                    continue;
                }

                for (let j = 0; j < field.options.length; j++) {
                    const option = field.options[j];

                    const optionToParse: InsertFormFieldOptionSchema = {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        automaticResult: option.automaticResult as any,
                        automaticResultObservations: option.automaticResultObservations,
                        fieldId: insertedField.id,
                        label: option.label,
                        order: option.order,
                    };
                    const optionParsed = insertFormFieldOptionSchema.parse(optionToParse);
                    const insertedOption = await DB.insert(formFieldOptionTable)
                        .values(optionParsed)
                        .returning()
                        .then((res) => res[0]);

                    optionsUUIDsToIds.set(option.uuid, insertedOption.id);
                }
            }

            if (form.closeDate) {
                const applicationsResultsQueue =
                    new SendApplicationStatusEmailsQueueMananger();
                applicationsResultsQueue.addSendFormResultsEmailJob(
                    form.id,
                    form.closeDate,
                );
            }

            return form;
        },
    }),
    updateForm: t.field({
        type: FormRef,
        args: {
            id: t.arg.int({
                required: true,
            }),
            input: t.arg({
                type: FormInputRef,
                required: true,
            }),
            fieldsIDsToDelete: t.arg.intList({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const originalForm = await DB.query.formTable.findFirst({
                where: (etc, { eq }) => {
                    return eq(etc.id, args.id);
                },
            });

            if (!originalForm) {
                throw new Error('No se encontró el formulario');
            }

            const formToParse: InsertFormSchema = {
                uuid: originalForm.uuid,
                title: args.input.title,
                openDate: args.input.openDate,
                closeDate: args.input.closeDate,
                resultsPublicationDate: args.input.resultsPublicationDate,
                convocatoryId: args.input.convocatoryId,
                termsAcceptanceOpenDate: args.input.termsAcceptanceOpenDate,
                termsAcceptanceCloseDate: args.input.termsAcceptanceCloseDate,
                version: args.input.version,
                resultsStatus: originalForm.resultsStatus,
            };
            const formParsed = insertFormSchema.parse(formToParse);
            const updatedForm = await DB.update(formTable)
                .set(formParsed)
                .where(eq(formTable.id, args.id))
                .returning()
                .then((res) => res[0]);

            if (!updatedForm) {
                throw new Error('Ocurrió un error al actualizar el formulario');
            }

            const fieldsUUIDsToIds = new Map<string, number>();
            const optionsUUIDsToIds = new Map<string, number>();
            for (let i = 0; i < args.input.fields.length; i++) {
                const field = args.input.fields[i];

                const fieldToParse: InsertFormFieldSchema = {
                    formId: updatedForm.id,
                    title: field.title,
                    description: field.description,
                    type: field.type,
                    isRequired: field.isRequired,
                    isImportant: field.isImportant,
                    minLength: field.minLength,
                    maxLength: field.maxLength,
                    order: field.order,
                    dependsOnFieldId: field.dependsOnFieldUUID
                        ? fieldsUUIDsToIds.get(field.dependsOnFieldUUID) ?? null
                        : null,
                    dependsOnFieldOptionId: field.dependsOnFieldOptionUUID
                        ? optionsUUIDsToIds.get(field.dependsOnFieldOptionUUID) ?? null
                        : null,
                };
                const fieldParsed = insertFormFieldSchema.parse(fieldToParse);

                let upsertedField: SelectFormFieldSchema | null = null;
                if (field.id) {
                    upsertedField = await DB.update(formFieldTable)
                        .set(fieldParsed)
                        .where(eq(formFieldTable.id, field.id))
                        .returning()
                        .then((res) => res[0]);
                } else {
                    upsertedField = await DB.insert(formFieldTable)
                        .values(fieldParsed)
                        .returning()
                        .then((res) => res[0]);
                }

                if (!upsertedField) {
                    throw new Error('Ocurrió un error al actualizar el campo');
                }

                fieldsUUIDsToIds.set(field.uuid, upsertedField.id);

                if (!field.options) {
                    continue;
                }

                for (let j = 0; j < field.options.length; j++) {
                    const option = field.options[j];

                    const optionToParse: InsertFormFieldOptionSchema = {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        automaticResult: option.automaticResult as any,
                        automaticResultObservations: option.automaticResultObservations,
                        fieldId: upsertedField.id,
                        label: option.label,
                        order: option.order,
                    };
                    const optionParsed = insertFormFieldOptionSchema.parse(optionToParse);

                    let upsertedOption: SelectFormFieldOptionSchema | null = null;
                    if (option.id) {
                        upsertedOption = await DB.update(formFieldOptionTable)
                            .set(optionParsed)
                            .where(eq(formFieldOptionTable.id, option.id))
                            .returning()
                            .then((res) => res[0]);
                    } else {
                        upsertedOption = await DB.insert(formFieldOptionTable)
                            .values(optionParsed)
                            .returning()
                            .then((res) => res[0]);
                    }

                    if (!upsertedOption) {
                        throw new Error('Ocurrió un error al actualizar la opción');
                    }

                    optionsUUIDsToIds.set(option.uuid, upsertedOption.id);
                }
            }

            for (let i = 0; i < args.fieldsIDsToDelete.length; i++) {
                await DB.delete(formFieldTable)
                    .where(eq(formFieldTable.id, args.fieldsIDsToDelete[i]))
                    .execute();
            }

            if (
                updatedForm.closeDate &&
                originalForm.closeDate !== updatedForm.closeDate
            ) {
                const applicationsResultsQueue =
                    new SendApplicationStatusEmailsQueueMananger();
                applicationsResultsQueue.addSendFormResultsEmailJob(
                    updatedForm.id,
                    updatedForm.closeDate,
                );
            }

            return updatedForm;
        },
    }),
}));
