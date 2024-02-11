import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core';

export const serviceLogTable = sqliteTable('logger_servicerequest', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
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
