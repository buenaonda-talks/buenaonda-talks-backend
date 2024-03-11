import { ApplicationStatus } from '@/db/shared';
import { schemaBuilder } from './schema-builder';
import { ScholarshipRef } from './scholarship';
import { ApplicationRef } from './scholarship-application';
import { FormRef } from './scholarship-form';
import { TalkRef } from './talk';
import {
    ScholarshipConvocatoryKind,
    SelectApplicationSchema,
    SelectFormSchema,
    SelectScholarshipSchema,
    SelectTalkSchema,
    applicationHistoryTable,
    applicationTable,
    convocatoryTable,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { isAfter } from 'date-fns';
import { eq } from 'drizzle-orm';
import { TalkRepository } from '@/db/repository/talk';
import { ScholarshipApplicationRepository } from '@/db/repository/scholarship-application';
import { FormRepository } from '@/db/repository/scholarship-form';
import { ScholarshipRepository } from '@/db/repository/scholarship';

type TrackerCurrentStep = {
    devfScholarship: SelectScholarshipSchema | null;
    devfForm: SelectFormSchema | null;
    devfPostulation: SelectApplicationSchema | null;
    platziScholarship: SelectScholarshipSchema | null;
    platziForm: SelectFormSchema | null;
    platziPostulation: SelectApplicationSchema | null;
    platziTalk: SelectTalkSchema | null;
};

const TrackerCurrentStepRef =
    schemaBuilder.objectRef<TrackerCurrentStep>('TrackerCurrentStep');
TrackerCurrentStepRef.implement({
    description: 'Representation of the current step of the user',
    fields: (t) => ({
        devfScholarship: t.field({
            type: ScholarshipRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.devfScholarship,
        }),
        devfForm: t.field({
            type: FormRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.devfForm,
        }),
        devfPostulation: t.field({
            type: ApplicationRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.devfPostulation,
        }),
        platziScholarship: t.field({
            type: ScholarshipRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.platziScholarship,
        }),
        platziForm: t.field({
            type: FormRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.platziForm,
        }),
        platziPostulation: t.field({
            type: ApplicationRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.platziPostulation,
        }),
        platziTalk: t.field({
            type: TalkRef,
            nullable: true,
            resolve: (trackerCurrentStep) => trackerCurrentStep.platziTalk,
        }),
    }),
});

const isValidStatus = (status: ApplicationStatus) => {
    if (status === ApplicationStatus.SUBMITTED) {
        return true;
    }

    if (status === ApplicationStatus.PENDING) {
        return true;
    }

    if (status === ApplicationStatus.DECLINED) {
        return false;
    }

    if (status === ApplicationStatus.ACCEPTED) {
        return true;
    }

    if (status === ApplicationStatus.ACCEPTED_TERMS) {
        return true;
    }

    if (status === ApplicationStatus.DECLINED_TERMS) {
        return false;
    }

    if (status === ApplicationStatus.TERMS_UNANSWERED) {
        return false;
    }

    return false;
};

const createTrackerCurrentStep = (field: Partial<TrackerCurrentStep>) => {
    return {
        devfScholarship: null,
        devfForm: null,
        devfPostulation: null,
        platziScholarship: null,
        platziForm: null,
        platziPostulation: null,
        platziTalk: null,
        ...field,
    };
};

const hasValidApplication = async ({
    application,
    DB,
}: {
    application: SelectApplicationSchema;
    DB: YogaContext['DB'];
}) => {
    const { currentStatusId, formId } = application;
    if (!currentStatusId || !formId) {
        return false;
    }

    const currentStatus = await DB.query.applicationHistoryTable.findFirst({
        where: (etc, { eq }) => eq(etc.id, currentStatusId),
    });
    const form = await DB.query.formTable.findFirst({
        where: (etc, { eq }) => eq(etc.id, formId),
    });

    if (!currentStatus || !form) {
        return false;
    }

    const now = new Date();
    const status = currentStatus.status;
    const termsCloseDate = form.termsAcceptanceCloseDate;

    const termsAreClosed = termsCloseDate !== null && isAfter(now, termsCloseDate);

    if (termsAreClosed) {
        if (status === ApplicationStatus.ACCEPTED) {
            const newHistory = await DB.insert(applicationHistoryTable)
                .values({
                    status: ApplicationStatus.TERMS_UNANSWERED,
                    submissionId: application.id,
                })
                .returning()
                .get();

            await DB.update(applicationTable)
                .set({
                    currentStatusId: newHistory.id,
                })
                .where(eq(applicationTable.id, application.id))
                .get();
        }
    } else {
        if (status === ApplicationStatus.TERMS_UNANSWERED) {
            const newHistory = await DB.insert(applicationHistoryTable)
                .values({
                    status: ApplicationStatus.ACCEPTED,
                    submissionId: application.id,
                })
                .returning()
                .get();

            await DB.update(applicationTable)
                .set({
                    currentStatusId: newHistory.id,
                })
                .where(eq(applicationTable.id, application.id))
                .get();
        }
    }

    return isValidStatus(status);
};

schemaBuilder.queryFields((t) => ({
    trackerCurrentStep: t.field({
        type: TrackerCurrentStepRef,
        authz: {
            rules: ['IsAuthenticated', 'IsStudent'],
        },
        resolve: async (parent, args, { DB, USER, STUDENT }) => {
            if (!STUDENT) {
                throw new Error('No student found');
            }

            // Check for DevF Scholarship
            const devfScholarship = await ScholarshipRepository.getScholarship(
                DB,
                USER,
                ScholarshipConvocatoryKind.DEVF,
            );

            if (devfScholarship) {
                return createTrackerCurrentStep({
                    devfScholarship: devfScholarship,
                });
            }

            // Check for Platzi Scholarship
            const platziScholarship = await ScholarshipRepository.getScholarship(
                DB,
                USER,
                ScholarshipConvocatoryKind.PLATZI,
            );

            const devfApplication =
                await ScholarshipApplicationRepository.getLastUserApplication(
                    DB,
                    USER,
                    ScholarshipConvocatoryKind.DEVF,
                );

            if (
                !devfApplication ||
                !hasValidApplication({ application: devfApplication, DB })
            ) {
                const devfForm = await FormRepository.getOpenForm(
                    DB,
                    ScholarshipConvocatoryKind.DEVF,
                    devfApplication ? [devfApplication.formId] : [],
                );

                if (devfForm && platziScholarship) {
                    return createTrackerCurrentStep({
                        devfForm: devfForm,
                        devfPostulation: devfApplication,
                    });
                }

                if (devfApplication) {
                    return createTrackerCurrentStep({
                        devfPostulation: devfApplication,
                    });
                }
            } else {
                return createTrackerCurrentStep({
                    devfPostulation: devfApplication,
                });
            }

            if (platziScholarship) {
                return createTrackerCurrentStep({
                    platziScholarship: platziScholarship,
                });
            }

            const platziApplication =
                await ScholarshipApplicationRepository.getLastUserApplication(
                    DB,
                    USER,
                    ScholarshipConvocatoryKind.PLATZI,
                );

            if (
                !platziApplication ||
                !hasValidApplication({ application: platziApplication, DB })
            ) {
                const platziForm = await FormRepository.getOpenForm(
                    DB,
                    ScholarshipConvocatoryKind.PLATZI,
                    platziApplication ? [platziApplication.formId] : [],
                );

                if (platziForm) {
                    return createTrackerCurrentStep({
                        platziForm: platziForm,
                        platziPostulation: platziApplication,
                    });
                }

                if (platziApplication) {
                    return createTrackerCurrentStep({
                        platziPostulation: platziApplication,
                    });
                }
            } else {
                return createTrackerCurrentStep({
                    platziPostulation: platziApplication,
                });
            }

            // Check for Talks
            const talkOpen = await TalkRepository.getOpenTalk(DB);
            const talkUpcoming = !talkOpen
                ? await TalkRepository.getUpcomingTalk(DB)
                : null;

            return createTrackerCurrentStep({
                platziTalk: talkOpen || talkUpcoming,
            });
        },
    }),
}));

schemaBuilder.mutationFields((t) => ({
    createTestConvocatory: t.field({
        type: 'Boolean',
        // authz: {
        //     rules: ['IsAuthenticated', 'IsAdmin'],
        // },
        resolve: async (parent, args, { DB }) => {
            await DB.insert(convocatoryTable).values({
                kind: ScholarshipConvocatoryKind.DEVF,
                privateLabel: 'Test Convocatory',
                order: 1,
                isWithdrawable: false,
                countAddingsFromDate: new Date('2021-12-24'),
            });

            return true;
        },
    }),
}));
