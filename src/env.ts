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

    if (
        !process.env.ZOOM_ACCOUNT_ID ||
        !process.env.ZOOM_CLIENT_ID ||
        !process.env.ZOOM_CLIENT_SECRET
    ) {
        throw new Error(
            `ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET are required. You can get these values from https://marketplace.zoom.us/`,
        );
    }

    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
        throw new Error(
            `REDIS_HOST and REDIS_PORT. Ensure that you have a Redis server running and that the environment variables are set.`,
        );
    }

    if (!process.env.EXPRESS_SESSION_SECRET) {
        throw new Error(
            `EXPRESS_SESSION_SECRET is required. You can set this to any random string.`,
        );
    }

    if (!process.env.BULL_ADMIN_USERNAME || !process.env.BULL_ADMIN_PASSWORD) {
        throw new Error(
            `BULL_ADMIN_USERNAME and BULL_ADMIN_PASSWORD are required. You can set these to any username and password.`,
        );
    }

    if (!process.env.EMAIL_FROM) {
        throw new Error(
            `EMAIL_FROM is required. You can set this to any email address allowed to send emails from Postmark.`,
        );
    }
};

export const env = {
    APP_ENV: process.env.APP_ENV || 'development',
    isProduction: process.env.APP_ENV === 'production',
    isStaging: process.env.APP_ENV === 'staging',
    isDevelopment: (process.env.APP_ENV || 'development') === 'development',
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
    ZOOM: {
        ACCOUNT_ID: process.env.ZOOM_ACCOUNT_ID!,
        CLIENT_ID: process.env.ZOOM_CLIENT_ID!,
        CLIENT_SECRET: process.env.ZOOM_CLIENT_SECRET!,
    },
    REDIS: {
        HOST: process.env.REDIS_HOST!,
        PORT: parseInt(process.env.REDIS_PORT!, 10),
        PASSWORD: process.env.REDIS_PASSWORD || '',
    },
    POSTMARK_API_KEY: process.env.POSTMARK_API_KEY!,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET!,
    ENFORCED_JWT_TOKEN: process.env.ENFORCED_JWT_TOKEN,
    PORT: process.env.PORT || 8787,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    EMAIL_FROM: process.env.EMAIL_FROM!,
};

// Validate environment variables at the start
validateEnv();
