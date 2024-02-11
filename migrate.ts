import { config } from 'dotenv';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const getClient = () => {
    config({ path: process.cwd() + '/.env', override: true });

    if (!process.env.TURSO_DB_URL) {
        throw new Error('TURSO_DB_URL is not defined');
    }

    if (!process.env.TURSO_DB_AUTH_TOKEN) {
        throw new Error('TURSO_DB_AUTH_TOKEN is not defined');
    }

    const client = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });

    return client;
};

const getMigrationFolder = () => {
    const rootProjectFolder = process.cwd();
    const migrationsFolder = rootProjectFolder + '/drizzle';
    return migrationsFolder;
};

const main = async () => {
    const client = getClient();
    const migrationsFolder = getMigrationFolder();

    console.log('Running migrations...');
    console.log('Migrations folder:', migrationsFolder);

    const db = drizzle(client);

    await migrate(db, {
        migrationsFolder,
        migrationsTable: 'migrations',
    });
};

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
