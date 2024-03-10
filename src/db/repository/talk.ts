import {
    SelectTalkSchema,
    SelectUserSchema,
    selectTalkInscriptionSchema,
    selectTalkSchema,
    talkInscriptionTable,
} from '@/db/drizzle-schema';
import { getRedisClient } from '@/redis-client';
import { ApiError } from '@/schema/api-error/ref';
import ZoomService from '@/service/ZoomService';
import { YogaContext } from '@/types';
import { eq } from 'drizzle-orm';

const OPEN_TALK_CACHE_KEY = 'open_talk';

export const TalkRepository = {
    delCurrentOpenTalkCache: async () => {
        const redisClient = await getRedisClient();
        await redisClient.del(OPEN_TALK_CACHE_KEY);
    },
    setCurrentOpenTalkCache: async ({ id }: { id: number }) => {
        const redisClient = await getRedisClient();
        await redisClient.set(OPEN_TALK_CACHE_KEY, id);
    },
    getCurrentOpenTalkCache: async () => {
        const redisClient = await getRedisClient();
        return redisClient.get(OPEN_TALK_CACHE_KEY);
    },
    getOpenTalk: async (DB: YogaContext['DB']) => {
        const cachedId = await TalkRepository.getCurrentOpenTalkCache();
        if (cachedId === '-1') {
            return null;
        }

        let talk: SelectTalkSchema | undefined = undefined;
        if (cachedId) {
            talk = await DB.query.talkTable.findFirst({
                where: (etc, operators) => {
                    return operators.and(
                        operators.eq(etc.id, parseInt(cachedId, 10)),
                        operators.isNull(etc.forOrganizationId),
                    );
                },
            });
        }

        if (!talk) {
            talk = await DB.query.talkTable.findFirst({
                where: (etc, operators) => {
                    return operators.and(
                        operators.lte(etc.startDateTime, new Date()),
                        operators.gte(etc.endDateTime, new Date()),
                        operators.isNull(etc.forOrganizationId),
                    );
                },
            });

            if (talk) {
                await TalkRepository.setCurrentOpenTalkCache({ id: talk.id });
            } else {
                await TalkRepository.setCurrentOpenTalkCache({ id: -1 });
            }
        }

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
    assistToTalk: async (
        DB: YogaContext['DB'],
        talkUuid: string,
        user: Pick<SelectUserSchema, 'id' | 'firstName' | 'lastName' | 'email'>,
    ) => {
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
                    operators.eq(etc.userId, user.id),
                );
            },
        });

        if (!inscription) {
            inscription = await TalkRepository.signUpToTalk(DB, talkUuid, user.id);
        }

        // TODO: GET LINK FROM ZOOM API
        let link = inscription.joinUrl;
        if (!link) {
            if (!talk.zoomId) {
                throw new ApiError({
                    code: 'TALK_WITHOUT_ZOOM',
                    message: 'La charla no tiene un ID de Zoom',
                });
            }

            const zoomService = new ZoomService();

            try {
                link = await zoomService.getJoinUrl({
                    user,
                    meetingId: parseInt(talk.zoomId, 10),
                });
            } catch (error) {
                throw new ApiError({
                    code: 'TALK_ZOOM_CONNECTION_ERROR',
                    message: 'Tuvimos un problema para comunicarnos con Zoom',
                });
            }
        }

        if (!link) {
            throw new ApiError({
                code: 'TALK_WITHOUT_LINK',
                message: 'No se pudo obtener el link de la charla',
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
