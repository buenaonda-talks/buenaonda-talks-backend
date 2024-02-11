import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({
    path: process.cwd() + '/.dev.vars',
    override: true,
});

if (!process.env.TURSO_DB_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const config: Config = {
    schema: './src/db/drizzle-schema.ts',
    out: './drizzle',
    driver: 'turso',
    dbCredentials: {
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_AUTH_TOKEN,
    },
};

export default config;
