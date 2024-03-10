import { sqliteTable, int, index, text } from 'drizzle-orm/sqlite-core';
import { userTable } from './user';
import { convocatoryTable } from './convocatory';
import { organizationTable } from './organization';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export enum TalkType {
    FIRST_PLATZI = 'FIRST_PLATZI',
    FIRST_PLATZI_REVINDICATION = 'FIRST_PLATZI_REVINDICATION',
    FIRST_PLATZI_INTRODUCTION = 'FIRST_PLATZI_INTRODUCTION',
    FIRST_DEVF = 'FIRST_DEVF',
    FIRST_DEVF_REVINDICATION = 'FIRST_DEVF_REVINDICATION',
    FIRST_DEVF_INTRODUCTION = 'FIRST_DEVF_INTRODUCTION',
}

export const talkTable = sqliteTable(
    'core_talkmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        uuid: text('uuid').notNull(),
        startDateTime: int('start_date', {
            mode: 'timestamp_ms',
        }).notNull(),
        endDateTime: int('end_date', {
            mode: 'timestamp_ms',
        }).notNull(),
        description: text('description'),
        type: text('type', {
            enum: [
                TalkType.FIRST_PLATZI,
                TalkType.FIRST_PLATZI_REVINDICATION,
                TalkType.FIRST_PLATZI_INTRODUCTION,
                TalkType.FIRST_DEVF,
                TalkType.FIRST_DEVF_REVINDICATION,
                TalkType.FIRST_DEVF_INTRODUCTION,
            ],
        }).notNull(),
        internalLabel: text('internal_label'),
        speakers: text('speakers').notNull(),
        zoomApiKey: text('zoom_api_key'),
        zoomApiSecret: text('zoom_api_secret'),
        zoomId: text('zoom_id'),
        convocatoryId: int('convocatory_id')
            .notNull()
            .references(() => convocatoryTable.id),
        forOrganizationId: int('for_organization_id').references(
            () => organizationTable.id,
        ),
        isVisible: int('is_visible', {
            mode: 'boolean',
        }).notNull(),
        zoomRegisterUrl: text('zoom_register_url'),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            forOrganizationIdBab7D394: index(
                'core_talkmodel_for_organization_id_bab7d394',
            ).on(table.forOrganizationId),
            convocatoryIdB454430C: index('core_talkmodel_convocatory_id_b454430c').on(
                table.convocatoryId,
            ),
            talkUuidIndex: index('core_talkmodel_uuid').on(table.uuid),
            startDateTimeIndex: index('core_talkmodel_start_date').on(
                table.startDateTime,
            ),
            endDateTimeIndex: index('core_talkmodel_end_date').on(table.endDateTime),
        };
    },
);

export const talkInscriptionTable = sqliteTable(
    'core_talkinscriptionmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        number: int('number').notNull(),
        joinUrl: text('join_url'),
        assisted: int('assisted', {
            mode: 'boolean',
        }),
        assistanceDatetime: int('assistance_datetime', {
            mode: 'timestamp_ms',
        }),
        talkId: int('talk_id')
            .notNull()
            .references(() => talkTable.id),
        userId: int('user_id')
            .notNull()
            .references(() => userTable.id),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            userId16B884F3: index('core_talkinscriptionmodel_user_id_16b884f3').on(
                table.userId,
            ),
            talkIdD3256188: index('core_talkinscriptionmodel_talk_id_d3256188').on(
                table.talkId,
            ),
        };
    },
);

export const selectTalkSchema = createSelectSchema(talkTable);
export type SelectTalkSchema = z.infer<typeof selectTalkSchema>;

export const insertTalkSchema = createInsertSchema(talkTable);

export const selectTalkInscriptionSchema = createSelectSchema(talkInscriptionTable);
export type SelectTalkInscriptionSchema = z.infer<typeof selectTalkInscriptionSchema>;
