import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({
    path: process.cwd() + '/.dev.vars',
    override: true,
});

if (!process.env.NEON_DB_URL) {
    throw new Error('DATABASE_URL is not defined');
}

// TODO: Add DB credentials
const config: Config = {
    schema: './src/db/drizzle-schema.ts',
    out: './drizzle',
    driver: 'pg',
};

export default config;
