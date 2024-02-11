import { createClient } from '@libsql/client';
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql';
import * as schema from './drizzle-schema';

export type ORM_TYPE = LibSQLDatabase<typeof schema>;

let db: ORM_TYPE | null = null;
export const getDb = () => {
    if (!db) {
        const client = createClient({
            url: process.env.TURSO_DB_URL!,
            authToken: process.env.TURSO_DB_AUTH_TOKEN!,
        });
        db = drizzle(client, { schema: { ...schema }, logger: false });
    }

    return db;
};
