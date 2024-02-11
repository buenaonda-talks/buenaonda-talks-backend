import { schemaBuilder } from '@/schema/schema-builder';
import { ApplicationRef } from './ref';
import {
    FormFieldType,
    InsertApplicationHistorySchema,
    InsertApplicationSchema,
    applicationFieldAnswerTable,
    applicationHistoryTable,
    applicationTable,
    insertApplicationHistorySchema,
    insertApplicationSchema,
} from '@/db/drizzle-schema';
import { and, eq } from 'drizzle-orm';
import { ApplicationStatus } from '@/db/shared';
import { ApiError, ApiErrorRef } from '../api-error/ref';
import { ApplicationStatusRef } from '../scholarship-form';
import { GraphQLError } from 'graphql';
import ApplicationStatusNotificationService, {
    ApplicationStatusNotificationServiceNotifyData,
} from '@/service/ApplicationStatusNotificationService';
import ApplicationStatusManager from '@/manager/ApplicationStatusManager';
import EmailStrategyService from '@/service/emails/EmailStrategyService';
import ApplicationStatusEmailStrategy from '@/service/emails/strategy/ApplicationStatusEmailStrategy';

const FormFieldAnswerInputRef = schemaBuilder.inputType('FormFieldAnswerInput', {
    fields: (t) => ({
        id: t.int({
            required: true,
        }),
        value: t.string({
            required: true,
        }),
    }),
});

const ApplyToScholarshipRef = schemaBuilder.unionType('ApplyToScholarship', {
    types: [ApplicationRef, ApiErrorRef],
    resolveType: (parent) => {
        if (parent instanceof ApiError) {
            return ApiErrorRef;
        }

        return ApplicationRef;
    },
});

schemaBuilder.mutationFields((t) => ({
    applyToScholarship: t.field({
        type: ApplyToScholarshipRef,
        args: {
            answers: t.arg({
                type: [FormFieldAnswerInputRef],
                required: true,
            }),
            uuid: t.arg({
                type: 'String',
                required: true,
            }),
            error: t.arg({
                type: 'String',
                required: false,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsStudent'],
        },
        resolve: async (parent, { answers, uuid }, { DB, STUDENT, USER }) => {
            if (!STUDENT) {
                return new ApiError({
                    code: 'NOT_AUTHENTICATED',
                    message: 'No estás autenticado',
                });
            }

            const form = await DB.query.formTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.uuid, uuid);
                },
            });
            if (!form) {
                return new ApiError({
                    code: 'FORM_NOT_FOUND',
                    message: 'El formulario no existe',
                });
            }

            const now = new Date();
            if (!form.openDate || now < form.openDate) {
                return new ApiError({
                    code: 'FORM_NOT_OPEN',
                    message: 'El formulario no está abierto',
                });
            }

            if (!form.closeDate || form.closeDate < now) {
                return new ApiError({
                    code: 'FORM_CLOSED',
                    message: 'El formulario está cerrado',
                });
            }

            const alreadyApplied = await DB.select()
                .from(applicationTable)
                .where(
                    and(
                        eq(applicationTable.formId, form.id),
                        eq(applicationTable.userId, USER.id),
                    ),
                )
                .get();

            if (alreadyApplied) {
                return new ApiError({
                    code: 'ALREADY_APPLIED',
                    message: 'Ya has aplicado a esta beca',
                });
            }

            for (const answer of answers) {
                const field = await DB.query.formFieldTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, answer.id);
                    },
                });
                if (!field) {
                    return new ApiError({
                        code: 'FIELD_NOT_FOUND',
                        message: `El campo con id ${answer.id} no existe`,
                    });
                }

                if (field.isRequired && !answer.value) {
                    return new ApiError({
                        code: 'MISSING_REQUIRED_FIELD',
                        message: `El campo "${field.title}" es requerido`,
                    });
                }

                if ([FormFieldType.TEXT, FormFieldType.TEXTAREA].includes(field.type)) {
                    if (field.minLength && answer.value.length < field.minLength) {
                        return new ApiError({
                            code: 'FIELD_TOO_SHORT',
                            message: `El campo "${field.title}" debe tener al menos ${field.minLength} caracteres`,
                        });
                    }

                    if (field.maxLength && answer.value.length > field.maxLength) {
                        return new ApiError({
                            code: 'FIELD_TOO_LONG',
                            message: `El campo "${field.title}" debe tener como máximo ${field.maxLength} caracteres`,
                        });
                    }
                }

                if (field.type === FormFieldType.RADIO_BOX) {
                    const answerAsId = parseInt(answer.value, 10);
                    if (isNaN(answerAsId)) {
                        return new ApiError({
                            code: 'INVALID_FIELD_VALUE',
                            message: `El valor del campo "${field.title}" es inválido`,
                        });
                    }

                    const option = await DB.query.formFieldOptionTable.findFirst({
                        where: (option, { eq }) => {
                            return eq(option.id, answerAsId);
                        },
                    });

                    if (!option) {
                        return new ApiError({
                            code: 'INVALID_FIELD_VALUE',
                            message: `El valor del campo "${field.title}" es inválido`,
                        });
                    }
                }
            }

            const newApplicationValuesToParse: InsertApplicationSchema = {
                formId: form.id,
                studentId: STUDENT.id,
                userId: USER.id,
                uuid: uuid,
                acceptedTerms: false,
                termsAcceptanceDate: null,
                currentStatusId: null,
            };

            const newApplicationValuesParse = insertApplicationSchema.parse(
                newApplicationValuesToParse,
            );
            const newApplication = await DB.insert(applicationTable)
                .values(newApplicationValuesParse)
                .returning()
                .get();

            for (const answer of answers) {
                await DB.insert(applicationFieldAnswerTable).values({
                    fieldId: answer.id,
                    submissionId: newApplication.id,
                    value: answer.value,
                });
            }

            const newPendingHistoryValuesToParse: InsertApplicationHistorySchema = {
                status: ApplicationStatus.PENDING,
                submissionId: newApplication.id,
            };
            const newPendingHistoryValuesParsed = insertApplicationHistorySchema.parse(
                newPendingHistoryValuesToParse,
            );
            const newPendingHistory = await DB.insert(applicationHistoryTable)
                .values(newPendingHistoryValuesParsed)
                .returning()
                .get();

            await DB.update(applicationTable)
                .set({
                    currentStatusId: newPendingHistory.id,
                })
                .where(eq(applicationTable.id, newApplication.id));

            return newApplication;
        },
    }),
    updateScholarshipApplicationStatus: t.field({
        type: ApplicationRef,
        args: {
            applicationId: t.arg.int({
                required: true,
            }),
            status: t.arg({
                type: ApplicationStatusRef,
                required: true,
            }),
            observations: t.arg.string({
                required: false,
            }),
            sendEmail: t.arg.boolean({
                required: false,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (
            parent,
            { applicationId, status, observations, sendEmail },
            { DB },
        ) => {
            const application = await DB.query.applicationTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, applicationId);
                },
            });
            if (!application) {
                throw new Error('La aplicación no existe');
            }

            const statusManager = new ApplicationStatusManager(DB);
            await statusManager.updateApplicationStatus(applicationId, {
                status,
                submissionId: application.id,
                observations,
            });

            if (sendEmail) {
                const studentUser = await DB.query.userTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, application.userId);
                    },
                    columns: {
                        email: true,
                        firstName: true,
                    },
                });

                if (!studentUser) {
                    throw new GraphQLError('El usuario no existe');
                }

                const emailService = new EmailStrategyService();
                const emailStrategy = new ApplicationStatusEmailStrategy();
                const service = new ApplicationStatusNotificationService(
                    DB,
                    emailService,
                    emailStrategy,
                    statusManager,
                );

                const notifyData: ApplicationStatusNotificationServiceNotifyData = {
                    applicationId: application.id,
                    observations: observations || null,
                    status: status,
                    user: studentUser,
                };
                service.notifyResultsViaEmail([notifyData]);
            }

            return application;
        },
    }),
}));
