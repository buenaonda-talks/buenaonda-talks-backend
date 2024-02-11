import { ProcessCallbackFunction } from 'bull';
import ApplicationStatusManager from '@/manager/ApplicationStatusManager';
import { getDb } from '@/db/get-db';
import ApplicationStatusNotificationService from '@/service/ApplicationStatusNotificationService';
import EmailStrategyService from '@/service/emails/EmailStrategyService';
import ApplicationStatusEmailStrategy from '@/service/emails/strategy/ApplicationStatusEmailStrategy';

const sendApplicationStatusEmailsJob: ProcessCallbackFunction<{
    formId: number;
}> = async (job, done) => {
    const { formId } = job.data;

    const db = getDb();

    const historyService = new ApplicationStatusManager(db);
    const emailService = new EmailStrategyService();
    const emailStrategy = new ApplicationStatusEmailStrategy();
    const service = new ApplicationStatusNotificationService(
        db,
        emailService,
        emailStrategy,
        historyService,
    );

    const applications = await service.fetchUnotifiedApplicationsByFormId(formId);
    if (!applications.length) {
        done();
        return;
    }

    const results = await service.processApplicationsStatuses(applications, formId);
    await service.notifyResultsViaEmail(results);

    done();
};

export default sendApplicationStatusEmailsJob;

export const sendApplicationStatusEmailsJobPath = __filename;
