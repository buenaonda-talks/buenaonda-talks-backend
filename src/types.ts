import { YogaInitialContext } from 'graphql-yoga';
import { SelectStudentSchema, SelectUserSchema } from './db/drizzle-schema';
import { ORM_TYPE } from './db/get-db';

export type YogaContext<Authenticated = true> = YogaInitialContext &
    (Authenticated extends true
        ? {
              DB: ORM_TYPE;
              USER: SelectUserSchema;
              STUDENT?: SelectStudentSchema | null;
              POSTMARK_API_KEY: string;
          }
        : Record<string, never>);

export interface YogaEnv {
    GRAPHQL_BASE_ENDPOINT: '/';
    CLERK_PEM_PUBLIC_KEY: string | undefined;
    CLERK_ISSUER_ID: string | undefined;
    ENFORCED_JWT_TOKEN: string | undefined;
}
