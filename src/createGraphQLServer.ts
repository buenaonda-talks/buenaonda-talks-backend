import { useImmediateIntrospection } from '@envelop/immediate-introspection';
import { authZEnvelopPlugin } from '@graphql-authz/envelop-plugin';
import { Plugin, createYoga, maskError } from 'graphql-yoga';
import { authzRules } from './authz-rules';
import { env } from './env';
import { YogaContext, YogaEnv } from './types';
import { yogaSchema } from './schema';
import { getDb } from './db/get-db';
import { getUserWithClerkAsync } from './auth-utils';
import { useMaskedErrors } from '@envelop/core';
import { initContextCache } from '@pothos/core';

export const createGraphQLServer = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugins: Plugin<any>[] = [
        useImmediateIntrospection(),
        authZEnvelopPlugin({ rules: authzRules }),
    ];

    if (env.isProduction) {
        plugins.push(
            useMaskedErrors({
                errorMessage: 'Internal Server Error',
                maskError: (error, message) => {
                    // eslint-disable-next-line no-console
                    console.error('ERROR', error);
                    return maskError(error, message);
                },
            }),
        );
    }

    if (env.isProduction || env.isStaging) {
        // TODO: Telemetry
    }

    const yoga = createYoga<YogaEnv>({
        plugins,
        schema: yogaSchema,
        landingPage: !env.isProduction,
        graphqlEndpoint: '/graphql',
        logging: env.isProduction ? true : 'debug',
        graphiql: () => {
            return {
                title: 'BuenaOnda Talks GraphiQL',
                subscriptionsProtocol: 'SSE',
                headers: env.isDevelopment
                    ? `{
                        "Authorization": "Bearer ${env.ENFORCED_JWT_TOKEN ?? 'INSERT_TOKEN_HERE'}",
                        "x-graphql-csrf-token": "your-csrf-token-in-production"
                    }`
                    : `{}`,
            };
        },
        cors: () => {
            return {
                origin: env.ALLOWED_ORIGIN,
                credentials: true,
                allowedHeaders: ['*'],
                methods: ['POST', 'GET', 'OPTIONS'],
            };
        },
        context: async ({ request }) => {
            const DB = getDb();

            let USER: YogaContext['USER'] | null = null;
            try {
                USER = await getUserWithClerkAsync({
                    request,
                    DB,
                });
            } catch (e) {
                throw e;
            }

            const STUDENT = USER
                ? await DB.query.studentProfileTable.findFirst({
                      where: (etc, { eq }) => eq(etc.userId, USER!.id),
                  })
                : null;

            return {
                ...initContextCache(),
                DB,
                USER,
                STUDENT,
            };
        },
    });

    return yoga;
};
