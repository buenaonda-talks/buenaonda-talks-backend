import {
    SelectTalkSchema,
    SelectTalkInscriptionSchema,
    selectConvocatorySchema,
    selectTalkInscriptionSchema,
    TalkType,
} from '@/db/drizzle-schema';

import { schemaBuilder } from '@/schema/schema-builder';
import { ConvocatoryRef } from '../convocatory';

export const TalkTypeRef = schemaBuilder.enumType(TalkType, {
    name: 'TalkType',
});

export const TalkRef = schemaBuilder.objectRef<SelectTalkSchema>('Talk');
schemaBuilder.objectType(TalkRef, {
    description: 'Representation of a talk',
    fields: (t) => ({
        id: t.exposeID('id'),
        uuid: t.exposeString('uuid'),
        startDate: t.field({
            type: 'DateTime',
            resolve: (talk) => talk.startDateTime,
        }),
        endDate: t.field({
            type: 'DateTime',
            resolve: (talk) => talk.endDateTime,
        }),
        description: t.exposeString('description', {
            nullable: true,
        }),
        type: t.field({
            type: TalkTypeRef,
            resolve: (talk) => talk.type,
        }),
        internalLabel: t.exposeString('internalLabel', {
            nullable: true,
        }),
        speakers: t.exposeString('speakers'),
        zoomApiKey: t.exposeString('zoomApiKey', {
            nullable: true,
        }),
        zoomApiSecret: t.exposeString('zoomApiSecret', {
            nullable: true,
        }),
        zoomId: t.exposeString('zoomId', {
            nullable: true,
        }),
        convocatoryId: t.exposeID('convocatoryId'),
        convocatory: t.field({
            type: ConvocatoryRef,
            resolve: async (talk, _args, { DB }) => {
                const convocatory = await DB.query.convocatoryTable.findFirst({
                    where: (field, operators) => {
                        return operators.eq(field.id, talk.convocatoryId);
                    },
                });

                if (!convocatory) {
                    throw new Error('Convocatory not found');
                }

                return selectConvocatorySchema.parse(convocatory);
            },
        }),
        forOrganizationId: t.exposeID('forOrganizationId', {
            nullable: true,
        }),
        isVisible: t.exposeBoolean('isVisible'),
        zoomRegisterUrl: t.exposeString('zoomRegisterUrl', {
            nullable: true,
        }),
        myInscription: t.field({
            type: TalkInscriptionRef,
            nullable: true,
            resolve: async (talk, _args, { DB, USER }) => {
                const inscription = await DB.query.talkInscriptionTable.findFirst({
                    where: (field, operators) => {
                        return operators.and(
                            operators.eq(field.talkId, talk.id),
                            operators.eq(field.userId, USER.id),
                        );
                    },
                });

                if (!inscription) {
                    return null;
                }

                return selectTalkInscriptionSchema.parse(inscription);
            },
        }),
    }),
});

export const TalkInscriptionRef =
    schemaBuilder.objectRef<SelectTalkInscriptionSchema>('TalkInscription');
schemaBuilder.objectType(TalkInscriptionRef, {
    description: 'Representation of a talk inscription',
    fields: (t) => ({
        id: t.exposeID('id'),
        number: t.exposeInt('number'),
        joinUrl: t.exposeString('joinUrl', {
            nullable: true,
        }),
        assisted: t.exposeBoolean('assisted', {
            nullable: true,
        }),
        assistanceDatetime: t.field({
            type: 'Date',
            resolve: (talkInscription) => talkInscription.assistanceDatetime,
            nullable: true,
        }),
        talkid: t.exposeID('talkId'),
        userid: t.exposeID('userId'),
    }),
});
