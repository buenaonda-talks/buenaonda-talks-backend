import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const getClient = () => {
    config({ path: process.cwd() + '/.env', override: true });

    if (!process.env.NEON_DB_URL) {
        throw new Error('NEON_DB_URL is not defined');
    }

    const migrationClient = postgres(process.env.NEON_DB_URL as string, { max: 1 });
    return migrationClient;
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
