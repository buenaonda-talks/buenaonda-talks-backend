import { selectUsersSchema, userTable } from '@/db/drizzle-schema';
import { ORM_TYPE } from '@/db/get-db';
import { z } from 'zod';
import { generateUsernameFromEmail as generateUsernameFromEmail } from './utils';
import { eq, or } from 'drizzle-orm';

export const UserProfileInfoSchema = z.object({
    sub: z.string(),
    email: z.string(),
    email_verified: z.boolean(),
    image_url: z.string(),
    two_factor_enabled: z.boolean(),
    external_id: z.string().nullable(),
    name: z.string().default(''),
    surname: z.string().default(''),
    unsafe_metadata: z.any().optional(),
    public_metadata: z.any().optional(),
});

export const updateUserProfileInfoAsync = async (
    db: ORM_TYPE,
    newProfileInfo: z.infer<typeof UserProfileInfoSchema>,
) => {
    const parsedProfileInfo = UserProfileInfoSchema.parse(newProfileInfo);

    const result = await db.query.userTable.findFirst({
        where: (u, { eq, or }) =>
            or(eq(u.email, parsedProfileInfo.email), eq(u.sub, parsedProfileInfo.sub)),
    });

    if (!result) {
        // we create the user
        const user = await db
            .insert(userTable)
            .values({
                sub: parsedProfileInfo.sub,
                email: parsedProfileInfo.email,
                username: generateUsernameFromEmail(parsedProfileInfo.email),

                firstName: parsedProfileInfo.name,
                normalizedFirstName: parsedProfileInfo.name.toLowerCase(),

                lastName: parsedProfileInfo.surname,
                normalizedLastName: parsedProfileInfo.surname.toLowerCase(),

                twoFactorEnabled: parsedProfileInfo.two_factor_enabled,
                imageUrl: parsedProfileInfo.image_url,
                emailVerified: parsedProfileInfo.email_verified,
                unsafeMetadata: parsedProfileInfo.unsafe_metadata ?? {},
                publicMetadata: parsedProfileInfo.public_metadata ?? {},
                dateJoined: new Date(),
            })
            .returning()
            .then((res) => res[0]);

        return selectUsersSchema.parse(user);
    }

    // we update the user
    const user = await db
        .update(userTable)
        .set({
            firstName: parsedProfileInfo.name,
            normalizedFirstName: parsedProfileInfo.name.toLowerCase(),

            lastName: parsedProfileInfo.surname,
            normalizedLastName: parsedProfileInfo.surname.toLowerCase(),

            twoFactorEnabled: parsedProfileInfo.two_factor_enabled,
            imageUrl: parsedProfileInfo.image_url,
            emailVerified: parsedProfileInfo.email_verified,
            unsafeMetadata: parsedProfileInfo.unsafe_metadata ?? {},
            publicMetadata: parsedProfileInfo.public_metadata ?? {},
        })
        .where(
            or(
                eq(userTable.email, parsedProfileInfo.email),
                eq(userTable.sub, parsedProfileInfo.sub),
            ),
        )
        .returning()
        .then((res) => res[0]);

    return selectUsersSchema.parse(user);
};
