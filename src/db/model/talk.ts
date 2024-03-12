import {
    pgTable,
    integer,
    index,
    text,
    serial,
    boolean,
    timestamp,
} from 'drizzle-orm/pg-core';
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

export const talkTable = pgTable(
    'core_talkmodel',
    {
        id: serial('id').primaryKey(),
        uuid: text('uuid').notNull(),
        startDateTime: timestamp('start_date').notNull(),
        endDateTime: timestamp('end_date').notNull(),
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
        convocatoryId: integer('convocatory_id')
            .notNull()
            .references(() => convocatoryTable.id, {
                onDelete: 'cascade',
            }),
        forOrganizationId: integer('for_organization_id').references(
            () => organizationTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        isVisible: boolean('is_visible').notNull(),
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

export const talkInscriptionTable = pgTable(
    'core_talkinscriptionmodel',
    {
        id: serial('id').primaryKey(),
        number: integer('number').notNull(),
        joinUrl: text('join_url'),
        assisted: boolean('assisted'),
        assistanceDatetime: timestamp('assistance_datetime'),
        talkId: integer('talk_id')
            .notNull()
            .references(() => talkTable.id, {
                onDelete: 'cascade',
            }),
        userId: integer('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
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
