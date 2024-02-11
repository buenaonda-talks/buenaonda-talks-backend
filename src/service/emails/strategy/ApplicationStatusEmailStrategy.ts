import { ApplicationStatus } from '@/db/shared';
import ApplicationStatusAcceptedEmail from 'emails/application-status-accepted';
import ApplicationStatusDeclinedEmail from 'emails/application-status-declined';
import ApplicationStatusPendingEmail from 'emails/application-status-pending';
import ApplicationStatusReceivedEmail from 'emails/application-status-received';
import React from 'react';
import { ComposedEmail, EmailStrategy } from '../EmailStrategyService';

type Options = {
    status: ApplicationStatus;
    user: { email: string; firstName: string };
    observations: string | null;
};

class ApplicationStatusEmailStrategy implements EmailStrategy<Options> {
    composeEmail({ status, user, observations }: Options): ComposedEmail {
        const data = this.getTemplateData(status);
        if (!data) {
            throw new Error('Invalid status');
        }

        const { Template, subject } = data;

        return {
            to: user.email,
            subject: subject,
            Template: React.createElement(Template, {
                firstName: user.firstName,
                observations: observations,
            }),
        };
    }

    private getTemplateData(status: ApplicationStatus): {
        Template: React.ComponentType<{ firstName: string; observations: string | null }>;
        subject: string;
    } | null {
        if (status === ApplicationStatus.ACCEPTED) {
            return {
                Template: ApplicationStatusAcceptedEmail,
                subject: '¡Felicidades! Tu postulación ha sido aceptada',
            };
        }

        if (status === ApplicationStatus.DECLINED) {
            return {
                Template: ApplicationStatusDeclinedEmail,
                subject: 'Tu postulación no ha sido aceptada',
            };
        }

        if (status === ApplicationStatus.PENDING) {
            return {
                Template: ApplicationStatusPendingEmail,
                subject: 'Tu postulación está pendiente de aceptación',
            };
        }

        if (status === ApplicationStatus.SUBMITTED) {
            return {
                Template: ApplicationStatusReceivedEmail,
                subject: 'Tu postulación ha sido recibida',
            };
        }

        return null;
    }
}

export default ApplicationStatusEmailStrategy;
