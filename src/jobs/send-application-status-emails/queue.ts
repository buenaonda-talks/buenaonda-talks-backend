import Queue from 'bull';
import { sendApplicationStatusEmailsJobPath } from './job';
import { env } from '@/env';

export const sendApplicationStatusEmailsQueue = new Queue('sendApplicationStatusEmails', {
    redis: { port: env.REDIS.PORT, host: env.REDIS.HOST, password: env.REDIS.PASSWORD },
});
sendApplicationStatusEmailsQueue.process(sendApplicationStatusEmailsJobPath);
