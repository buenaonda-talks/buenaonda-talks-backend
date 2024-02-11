import {
    ApplicationEmailResultNotificationStatus,
    SelectApplicationSchema,
    SelectFormFieldOptionSchema,
    applicationTable,
} from '@/db/drizzle-schema';
import { ORM_TYPE } from '@/db/get-db';
import { ApplicationStatus } from '@/db/shared';
import pLimit from 'p-limit';
import { eq } from 'drizzle-orm';
import ApplicationStatusManager from '../manager/ApplicationStatusManager';
import EmailStrategyService from './emails/EmailStrategyService';
import ApplicationStatusEmailStrategy from './emails/strategy/ApplicationStatusEmailStrategy';

export type ApplicationStatusNotificationServiceNotifyData = {
    applicationId: number;
    status: ApplicationStatus;
    observations: string | null;
    user: { email: string; firstName: string };
};

class ApplicationStatusNotificationService {
    private db: ORM_TYPE;
    private emailService: EmailStrategyService;
    private historyService: ApplicationStatusManager;
    private emailStrategy: ApplicationStatusEmailStrategy;

    constructor(
        db: ORM_TYPE,
        emailService: EmailStrategyService,
        emailStrategy: ApplicationStatusEmailStrategy,
        historyService: ApplicationStatusManager,
    ) {
        this.db = db;
        this.emailService = emailService;
        this.emailStrategy = emailStrategy;
        this.historyService = historyService;
    }

    public async fetchUnotifiedApplicationsByFormId(formId: number) {
        return await this.db.query.applicationTable.findMany({
            where: (etc, { eq, and, inArray }) => {
                return and(
                    eq(etc.formId, formId),
                    inArray(etc.resultNotificationViaEmailStatus, [
                        ApplicationEmailResultNotificationStatus.NOT_SENT,
                        ApplicationEmailResultNotificationStatus.FAILED,
                    ]),
                );
            },
            columns: { id: true, userId: true },
        });
    }

    public async processApplicationsStatuses(
        applications: Pick<SelectApplicationSchema, 'id' | 'userId'>[],
        formId: number,
    ): Promise<ApplicationStatusNotificationServiceNotifyData[]> {
        const { relevantOptions, relevantFieldsIds } =
            await this.historyService.fetchRelevantFormFields(formId);

        const results = await Promise.all(
            applications.map(async (application) => {
                return await this.processApplicationStatus(
                    application,
                    relevantOptions,
                    relevantFieldsIds,
                );
            }),
        );

        return results.filter(
            (result) => result !== null,
        ) as ApplicationStatusNotificationServiceNotifyData[];
    }

    public async notifyResultsViaEmail(
        results: ApplicationStatusNotificationServiceNotifyData[],
    ) {
        const limit = pLimit(5);
        const emailPromises = results.map((result) => {
            return limit(async () => {
                try {
                    await this.emailService.sendEmail(this.emailStrategy, result);
                    await this.updateApplicationEmailStatus(
                        result.applicationId,
                        ApplicationEmailResultNotificationStatus.SENT,
                    );
                } catch (error) {
                    await this.updateApplicationEmailStatus(
                        result.applicationId,
                        ApplicationEmailResultNotificationStatus.FAILED,
                    );
                }
            });
        });
        await Promise.all(emailPromises);
    }

    private async updateApplicationEmailStatus(
        applicationId: number,
        status: ApplicationEmailResultNotificationStatus,
    ) {
        await this.db
            .update(applicationTable)
            .set({
                resultNotificationViaEmailStatus: status,
            })
            .where(eq(applicationTable.id, applicationId));
    }

    private async processApplicationStatus(
        application: Pick<SelectApplicationSchema, 'id' | 'userId'>,
        relevantOptions: Pick<
            SelectFormFieldOptionSchema,
            'automaticResultObservations' | 'id' | 'automaticResult'
        >[],
        relevantFieldsIds: number[],
    ): Promise<ApplicationStatusNotificationServiceNotifyData | null> {
        const studentUser = await this.fetchStudentUser(application.userId);
        if (!studentUser) return null;

        const newHistoryValues = await this.historyService.evaluateApplicationStatus(
            application.id,
            relevantOptions,
            relevantFieldsIds,
        );

        await this.historyService.updateApplicationStatus(
            application.id,
            newHistoryValues,
        );

        return {
            applicationId: application.id,
            status: newHistoryValues.status,
            observations: newHistoryValues.observations || null,
            user: studentUser,
        };
    }

    private async fetchStudentUser(userId: number) {
        const studentUser = await this.db.query.userTable.findFirst({
            where: (etc, { eq }) => eq(etc.id, userId),
            columns: { email: true, firstName: true },
        });

        if (!studentUser) {
            return null;
        }

        return studentUser;
    }
}

export default ApplicationStatusNotificationService;
