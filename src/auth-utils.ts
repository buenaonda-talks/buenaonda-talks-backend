import { UserProfileInfoSchema, updateUserProfileInfoAsync } from './clerk';
import { ORM_TYPE } from './db/get-db';
import { Clerk, verifyToken } from '@clerk/backend';
import type { JwtPayload } from '@clerk/types';
import { adminProfileTable, studentProfileTable } from './db/drizzle-schema';
import { eq } from 'drizzle-orm';
import { env } from './env';

type Options = {
    request: Request;
    DB: ORM_TYPE;
};

export const getUserWithClerkAsync = async ({ request, DB }: Options) => {
    const JWT_TOKEN = (request.headers.get('Authorization') ?? '').split(' ')[1];
    if (!JWT_TOKEN) {
        return null;
    }

    let verified: JwtPayload | null = null;
    try {
        verified = await verifyToken(JWT_TOKEN, {
            issuer: env.CLERK.ISSUER_ID,
            jwtKey: env.CLERK.PEM_PUBLIC_KEY,
        });
    } catch (e) {
        verified = null;
    }

    if (!verified) {
        return null;
    }

    const {
        email,
        email_verified,
        two_factor_enabled,
        image_url,
        external_id,
        name,
        surname,
        unsafe_metadata,
        public_metadata,
        sub,
        exp,
    } = verified;

    if (exp < Date.now() / 1000) {
        return null;
    }

    const profileInfo = UserProfileInfoSchema.parse({
        email,
        email_verified,
        two_factor_enabled,
        image_url,
        external_id,
        name,
        surname,
        unsafe_metadata,
        public_metadata,
        sub,
    });

    const user = await updateUserProfileInfoAsync(DB, profileInfo);
    const isStudent = await DB.select({
        id: studentProfileTable.id,
    })
        .from(studentProfileTable)
        .where(eq(studentProfileTable.userId, user.id))
        .limit(1)
        .then((res) => res[0])
        .then((x) => !!x?.id);

    const isAdmin = await DB.select({
        id: adminProfileTable.id,
    })
        .from(adminProfileTable)
        .where(eq(adminProfileTable.userId, user.id))
        .limit(1)
        .then((res) => res[0])
        .then((x) => !!x?.id);

    const isSuperAdmin = user.isSuperAdmin;

    await Clerk({
        secretKey: env.CLERK.SECRET_KEY,
        jwtKey: env.CLERK.PEM_PUBLIC_KEY,
    }).users.updateUserMetadata(verified.id as string, {
        publicMetadata: {
            roles: [...(isStudent ? ['student'] : []), ...(isAdmin ? ['admin'] : [])],
            ...(isSuperAdmin ? ['superadmin'] : []),
        },
    });

    return user;
};
