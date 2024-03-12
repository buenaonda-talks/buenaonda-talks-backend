import { pgTable, text, serial } from 'drizzle-orm/pg-core';

export const serviceLogTable = pgTable('logger_servicerequest', {
    id: serial('id').primaryKey(),
    createdAt: text('created_at').notNull(),
    startedAt: text('started_at'),
    finishedAt: text('finished_at'),
    service: text('service').notNull(),
    status: text('status').notNull(),
    url: text('url').notNull(),
    headers: text('headers').notNull(),
    data: text('data'),
    method: text('method').notNull(),
    response: text('response'),
});
