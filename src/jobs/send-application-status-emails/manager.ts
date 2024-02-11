import { sendApplicationStatusEmailsQueue } from './queue';

class SendApplicationStatusEmailsQueueMananger {
    _getSendFormResultsEmailJobId(id: number) {
        return `sendApplicationsResultsEmails:${id}`;
    }

    async addSendFormResultsEmailJob(formId: number, atFutureDate: Date) {
        const jobId = this._getSendFormResultsEmailJobId(formId);
        const existingJob = await sendApplicationStatusEmailsQueue.getJob(jobId);
        const now = new Date();
        const delay = atFutureDate.getTime() - now.getTime();

        if (existingJob) {
            await existingJob.remove();
        }

        if (delay < 0) {
            return;
        }

        await sendApplicationStatusEmailsQueue.add(
            {
                formId: formId,
            },
            {
                jobId: jobId,
                delay: delay,
            },
        );
    }
}

export default SendApplicationStatusEmailsQueueMananger;
