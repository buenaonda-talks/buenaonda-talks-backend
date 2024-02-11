import {
    selectTalkInscriptionSchema,
    selectTalkSchema,
    talkInscriptionTable,
} from '@/db/drizzle-schema';
import { ApiError } from '@/schema/api-error/ref';
import { YogaContext } from '@/types';
import { eq } from 'drizzle-orm';

export const TalkRepository = {
    getOpenTalk: async (DB: YogaContext['DB']) => {
        const talk = await DB.query.talkTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.lte(etc.startDateTime, new Date()),
                    operators.gte(etc.endDateTime, new Date()),
                    operators.isNull(etc.forOrganizationId),
                );
            },
        });

        if (!talk) {
            return null;
        }

        return selectTalkSchema.parse(talk);
    },
    getUpcomingTalk: async (DB: YogaContext['DB']) => {
        const talk = await DB.query.talkTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.gte(etc.startDateTime, new Date()),
                    operators.isNull(etc.forOrganizationId),
                );
            },
        });

        if (!talk) {
            return null;
        }

        return selectTalkSchema.parse(talk);
    },
    signUpToTalk: async (DB: YogaContext['DB'], talkUuid: string, userId: number) => {
        const talk = await DB.query.talkTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.eq(etc.uuid, talkUuid),
                    operators.eq(etc.isVisible, true),
                );
            },
        });

        if (!talk) {
            throw new ApiError({
                code: 'TALK_NOT_FOUND',
                message: 'La charla no existe',
            });
        }

        if (talk.endDateTime < new Date()) {
            throw new ApiError({
                code: 'TALK_ENDED',
                message: 'La charla ya ha terminado',
            });
        }

        const inscription = await DB.query.talkInscriptionTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.eq(etc.talkId, talk.id),
                    operators.eq(etc.userId, userId),
                );
            },
        });

        if (inscription) {
            return selectTalkInscriptionSchema.parse(inscription);
        }

        const generatedNumberOfMax5Characters = Math.floor(Math.random() * 100000);

        const newInscription = await DB.insert(talkInscriptionTable)
            .values({
                number: generatedNumberOfMax5Characters,
                talkId: talk.id,
                userId: userId,
            })
            .returning()
            .get();

        return selectTalkInscriptionSchema.parse(newInscription);
    },
    assistToTalk: async (DB: YogaContext['DB'], talkUuid: string, userId: number) => {
        const talk = await DB.query.talkTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.eq(etc.uuid, talkUuid),
                    operators.eq(etc.isVisible, true),
                );
            },
        });

        if (!talk) {
            throw new ApiError({
                code: 'TALK_NOT_FOUND',
                message: 'La charla no existe',
            });
        }

        if (talk.startDateTime > new Date()) {
            throw new ApiError({
                code: 'TALK_NOT_STARTED',
                message: 'La charla no ha comenzado',
            });
        }

        if (talk.endDateTime < new Date()) {
            throw new ApiError({
                code: 'TALK_ENDED',
                message: 'La charla ya ha terminado',
            });
        }

        let inscription = await DB.query.talkInscriptionTable.findFirst({
            where: (etc, operators) => {
                return operators.and(
                    operators.eq(etc.talkId, talk.id),
                    operators.eq(etc.userId, userId),
                );
            },
        });

        if (!inscription) {
            inscription = await TalkRepository.signUpToTalk(DB, talkUuid, userId);
        }

        // TODO: GET LINK FROM ZOOM API
        const link = inscription.joinUrl;
        if (!link) {
            throw new ApiError({
                code: 'TALK_LINK_NOT_FOUND',
                message: 'No se encontró el link para la charla',
            });
        }

        await DB.update(talkInscriptionTable)
            .set({
                assisted: true,
                assistanceDatetime: new Date(),
            })
            .where(eq(talkInscriptionTable.id, inscription.id));

        return link;
    },
};
