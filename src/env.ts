import 'dotenv/config';

export const validateEnv = () => {
    if (
        !process.env.CLERK_PEM_PUBLIC_KEY ||
        !process.env.CLERK_ISSUER_ID ||
        !process.env.CLERK_SECRET_KEY
    ) {
        throw new Error(
            `CLERK_PEM_PUBLIC_KEY, CLERK_ISSUER_ID, and CLERK_SECRET_KEY are required. You can get these values from https://dashboard.clerk.com/`,
        );
    }

    if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_AUTH_TOKEN) {
        throw new Error(
            `TURSO_DB_URL and TURSO_DB_AUTH_TOKEN are required. You can get these values from https://turso.tech/app`,
        );
    }

    if (!process.env.POSTMARK_API_KEY) {
        throw new Error(
            `POSTMARK_API_KEY is required. You can get this value from https://account.postmarkapp.com/servers`,
        );
    }
};

export const env = {
    APP_ENV: process.env.APP_ENV || 'development',
    isProduction: process.env.APP_ENV === 'production',
    isStaging: process.env.APP_ENV === 'staging',
    isDevelopment: process.env.APP_ENV === 'development',
    BULL_ADMIN: {
        username: process.env.BULL_ADMIN_USERNAME!,
        password: process.env.BULL_ADMIN_PASSWORD!,
    },
    CLERK: {
        PEM_PUBLIC_KEY: process.env.CLERK_PEM_PUBLIC_KEY!.replace(/\\n/g, '\n'),
        ISSUER_ID: process.env.CLERK_ISSUER_ID!,
        SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    },
    TURSO: {
        DB_URL: process.env.TURSO_DB_URL!,
        DB_AUTH_TOKEN: process.env.TURSO_DB_AUTH_TOKEN!,
    },
    POSTMARK_API_KEY: process.env.POSTMARK_API_KEY!,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET!,
    ENFORCED_JWT_TOKEN: process.env.ENFORCED_JWT_TOKEN,
    PORT: process.env.PORT || 8787,
};

// Validate environment variables at the start
validateEnv();
