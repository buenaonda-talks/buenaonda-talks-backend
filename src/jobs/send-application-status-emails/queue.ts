import Queue from 'bull';
import { sendApplicationStatusEmailsJobPath } from './job';

export const sendApplicationStatusEmailsQueue = new Queue('sendApplicationStatusEmails', {
    redis: { port: 6379, host: '127.0.0.1' },
});
sendApplicationStatusEmailsQueue.process(sendApplicationStatusEmailsJobPath);
