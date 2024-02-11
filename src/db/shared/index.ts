import { sql } from 'drizzle-orm';
import { integer, int } from 'drizzle-orm/sqlite-core';

export const timestampField = (fieldName: string) => {
    return integer(fieldName, { mode: 'timestamp_ms' });
};

export const TIMESTAMP_FIELDS = {
    createdOn: int('created_on', {
        mode: 'timestamp_ms',
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    modifiedOn: int('modified_on', {
        mode: 'timestamp_ms',
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
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
