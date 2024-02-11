import { sendReactEmail } from '@/schema/emails';

export interface ComposedEmail {
    to: string;
    subject: string;
    Template: JSX.Element;
}

export interface EmailStrategy<T> {
    composeEmail(details: T): ComposedEmail;
}

class EmailStrategyService {
    private postmarkApiKey: string;

    constructor() {
        this.postmarkApiKey = process.env.POSTMARK_API_KEY!;
    }

    async sendEmail<T>(strategy: EmailStrategy<T>, details: T): Promise<void> {
        const emailDetails = strategy.composeEmail(details);
        await this.send(emailDetails);
    }

    private async send({ to, subject, Template }: ComposedEmail): Promise<void> {
        await sendReactEmail({
            To: to,
            Subject: subject,
            Component: Template,
            POSTMARK_API_KEY: this.postmarkApiKey,
        });
    }
}

export default EmailStrategyService;
