import { timestamp } from 'drizzle-orm/pg-core';

export const TIMESTAMP_FIELDS = {
    createdOn: timestamp('created_on').defaultNow().notNull(),
    modifiedOn: timestamp('modified_on').defaultNow().notNull(),
};

export enum ApplicationStatus {
    SUBMITTED = 'SUBMITED',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    PENDING = 'PENDING',
    DECLINED_TERMS = 'DECLINED_TERMS',
    ACCEPTED_TERMS = 'ACCEPTED_TERMS',
    TERMS_UNANSWERED = 'TERMS_UNANSWERED',
}
