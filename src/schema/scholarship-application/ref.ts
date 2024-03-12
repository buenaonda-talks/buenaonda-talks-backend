import {
    SelectApplicationSchema,
    SelectApplicationFieldAnswerSchema,
    SelectApplicationHistorySchema,
} from '@/db/model/scholarship-application';

import { schemaBuilder } from '@/schema/schema-builder';
import { ApplicationStatusRef, FormRef } from '../scholarship-form';
import { selectFormSchema, selectUsersSchema } from '@/db/drizzle-schema';
import { UserRef } from '../user';

export const ApplicationRef =
    schemaBuilder.objectRef<SelectApplicationSchema>('Application');
schemaBuilder.objectType(ApplicationRef, {
    description: 'Representation of a scholarship application',
    fields: (t) => ({
        id: t.exposeID('id'),

        createdOn: t.field({
            type: 'DateTime',
            resolve: (parent) => {
                return parent.createdOn;
            },
        }),

        acceptedTerms: t.exposeBoolean('acceptedTerms', {
            nullable: true,
        }),
        termsAcceptanceDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (parent) => {
                if (!parent.termsAcceptanceDate) {
                    return null;
                }

                return new Date(parent.termsAcceptanceDate);
            },
        }),

        formId: t.exposeID('formId'),
        form: t.field({
            type: FormRef,
            resolve: async (parent, _args, { DB }) => {
                const form = await DB.query.formTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, parent.formId);
                    },
                });

                if (!form) {
                    throw new Error('Form not found');
                }

                return selectFormSchema.parse(form);
            },
        }),

        studentId: t.exposeID('studentId'),
        user: t.field({
            type: UserRef,
            resolve: async (parent, _args, { DB }) => {
                const user = await DB.query.userTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, parent.userId);
                    },
                });

                if (!user) {
                    throw new Error('Student not found');
                }

                return selectUsersSchema.parse(user);
            },
        }),

        uuid: t.exposeString('uuid'),
        currentStatusid: t.exposeID('currentStatusId', {
            nullable: true,
        }),
        currentStatus: t.field({
            type: ApplicationHistoryRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const { currentStatusId } = parent;
                if (!currentStatusId) {
                    return null;
                }

                const history = await DB.query.applicationHistoryTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, currentStatusId);
                    },
                });

                if (!history) {
                    return null;
                }

                return history;
            },
        }),
        resultNotificationViaEmailStatus: t.exposeString(
            'resultNotificationViaEmailStatus',
        ),

        answers: t.field({
            type: [ApplicationFieldAnswerRef],
            resolve: async (parent, _args, { DB }) => {
                const answers = await DB.query.applicationFieldAnswerTable.findMany({
                    where: (field, { eq }) => {
                        return eq(field.submissionId, parent.id);
                    },
                });

                return answers;
            },
        }),
    }),
});

export const ApplicationFieldAnswerRef =
    schemaBuilder.objectRef<SelectApplicationFieldAnswerSchema>('ApplicationFieldAnswer');
schemaBuilder.objectType(ApplicationFieldAnswerRef, {
    description: 'Representation of a scholarship application field answer',
    fields: (t) => ({
        id: t.exposeID('id'),
        value: t.exposeString('value', {
            nullable: true,
        }),
        fieldId: t.exposeID('fieldId'),
        submissionid: t.exposeID('submissionId'),
    }),
});

export const ApplicationHistoryRef =
    schemaBuilder.objectRef<SelectApplicationHistorySchema>('ApplicationHistory');
schemaBuilder.objectType(ApplicationHistoryRef, {
    description: 'Representation of a scholarship application history',
    fields: (t) => ({
        id: t.exposeID('id'),
        status: t.field({
            type: ApplicationStatusRef,
            resolve: (parent) => parent.status,
        }),
        observations: t.exposeString('observations', {
            nullable: true,
        }),
        submissionid: t.exposeID('submissionId'),
    }),
});
