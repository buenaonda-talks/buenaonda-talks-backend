import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './drizzle-schema';
import postgres from 'postgres';

export type ORM_TYPE = PostgresJsDatabase<typeof schema>;

let db: ORM_TYPE | null = null;
export const getDb = () => {
    if (!db) {
        const queryClient = postgres(process.env.NEON_DB_URL as string);
        db = drizzle(queryClient, { schema: { ...schema }, logger: false });
    }

    return db;
};
