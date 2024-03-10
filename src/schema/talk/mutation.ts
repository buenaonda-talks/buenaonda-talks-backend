import { schemaBuilder } from '@/schema/schema-builder';
import { TalkInscriptionRef, TalkRef, TalkTypeRef } from './ref';
import { TalkRepository } from '@/db/repository/talk';
import { insertTalkSchema, talkTable } from '@/db/drizzle-schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { ApiError, ApiErrorRef } from '../api-error/ref';

const TalkInputRef = schemaBuilder.inputType('TalkInput', {
    fields: (t) => ({
        startDateTime: t.field({
            type: 'DateTime',
            required: true,
        }),
        endDateTime: t.field({
            type: 'DateTime',
            required: true,
        }),
        description: t.string({
            required: false,
        }),
        type: t.field({
            type: TalkTypeRef,
            required: true,
        }),
        internalLabel: t.string({
            required: false,
        }),
        speakers: t.string({
            required: true,
        }),
        zoomApiKey: t.string({
            required: false,
        }),
        zoomApiSecret: t.string({
            required: false,
        }),
        zoomId: t.string({
            required: false,
        }),
        convocatoryId: t.int({
            required: true,
        }),
        forOrganizationId: t.int({
            required: false,
        }),
        isVisible: t.boolean({
            required: true,
        }),
        zoomRegisterUrl: t.string({
            required: false,
        }),
    }),
});

const SignUpToTalkRef = schemaBuilder.unionType('SignUpToTalk', {
    types: [TalkInscriptionRef, ApiErrorRef],
    resolveType: (parent) => {
        if (parent instanceof ApiError) {
            return ApiErrorRef;
        }

        return TalkInscriptionRef;
    },
});

class AssistToTalkLink {
    url: string;

    constructor({ url }: { url: string }) {
        this.url = url;
    }
}

const AssistToTalkLinkRef = schemaBuilder.objectType(AssistToTalkLink, {
    name: 'AssistToTalkLink',
    description: 'Representation of a link to assist to a talk',
    fields: (t) => ({
        url: t.exposeString('url', {
            description: 'The URL to join the talk',
        }),
    }),
});

const AssistToTalkRef = schemaBuilder.unionType('AssistToTalk', {
    types: [AssistToTalkLinkRef, ApiErrorRef],
    resolveType: (parent) => {
        if (parent instanceof ApiError) {
            return ApiErrorRef;
        }

        return AssistToTalkLinkRef;
    },
});

schemaBuilder.mutationFields((t) => ({
    createTalk: t.field({
        type: TalkRef,
        args: {
            input: t.arg({
                type: TalkInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const values = insertTalkSchema.parse({
                ...args.input,
                uuid: uuidv4(),
            });

            const talk = await DB.insert(talkTable).values(values).returning().get();
            if (!talk) {
                throw new Error('Ocurrió un error al crear la charla');
            }

            TalkRepository.delCurrentOpenTalkCache();

            return talk;
        },
    }),
    updateTalk: t.field({
        type: TalkRef,
        args: {
            id: t.arg.int({
                required: true,
            }),
            input: t.arg({
                type: TalkInputRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const talk = await DB.query.talkTable.findFirst({
                where: (etc, { eq }) => eq(etc.id, args.id),
            });

            if (!talk) {
                throw new Error('No se encontró la charla');
            }

            const values = insertTalkSchema.parse({
                ...talk,
                ...args.input,
            });

            const updatedTalk = await DB.update(talkTable)
                .set(values)
                .where(eq(talkTable.id, args.id))
                .returning()
                .get();

            if (!updatedTalk) {
                throw new Error('Ocurrió un error al actualizar la charla');
            }

            TalkRepository.delCurrentOpenTalkCache();

            return updatedTalk;
        },
    }),
    signUpToTalk: t.field({
        type: SignUpToTalkRef,
        args: {
            talkUuid: t.arg.string({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated'],
        },
        resolve: async (parent, args, { DB, USER }) => {
            try {
                const inscription = await TalkRepository.signUpToTalk(
                    DB,
                    args.talkUuid,
                    USER.id,
                );

                return inscription;
            } catch (error) {
                if (error instanceof ApiError) {
                    return error;
                }

                return new ApiError({
                    code: 'SIGN_UP_TO_TALK_ERROR',
                    message: 'Ocurrió un error al inscribirte a la charla',
                });
            }
        },
    }),
    assistToTalk: t.field({
        type: AssistToTalkRef,
        args: {
            talkUuid: t.arg.string({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated'],
        },
        resolve: async (parent, args, { DB, USER }) => {
            try {
                const link = await TalkRepository.assistToTalk(DB, args.talkUuid, USER);

                return new AssistToTalkLink({
                    url: link,
                });
            } catch (error) {
                if (error instanceof ApiError) {
                    return error;
                }

                return new ApiError({
                    code: 'ASSIST_TO_TALK_ERROR',
                    message:
                        'Ocurrió un error al obtener el link para asistir a la charla',
                });
            }
        },
    }),
}));
