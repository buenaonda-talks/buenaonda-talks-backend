import {
    pgTable,
    integer,
    index,
    text,
    PgColumn,
    serial,
    boolean,
    date,
} from 'drizzle-orm/pg-core';
import { convocatoryTable } from './convocatory';
import { studentProfileTable, userTable } from './user';
import { devfBatchGroupTable } from './devf';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { applicationTable } from './scholarship-application';

export const scholarshipTable = pgTable(
    'core_scholarshipmodel',
    {
        id: serial('id').primaryKey(),
        uuid: text('uuid').notNull(),
        convocatoryId: integer('convocatory_id')
            .notNull()
            .references(() => convocatoryTable.id, {
                onDelete: 'cascade',
            }),
        applicationId: integer('postulation_id').references(
            (): PgColumn => applicationTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        userId: integer('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        studentId: integer('student_id')
            .notNull()
            .references(() => studentProfileTable.id, {
                onDelete: 'cascade',
            }),
        resignDate: date('resign_date', { mode: 'date' }),
        resignInfluences: text('resign_influences'),
        resignReasons: text('resign_reasons'),
        resigned: boolean('resigned').notNull(),
        askedToRenew: boolean('asked_to_renew').notNull(),
        askedToRenewDate: date('asked_to_renew_date', { mode: 'date' }),
        currentStatusId: integer('current_status_id').references(
            (): PgColumn => scholarshipStatusHistoryTable.id,
            {
                onDelete: 'set null',
            },
        ),
        devfBatchGroupId: integer('devf_batch_group_id').references(
            () => devfBatchGroupTable.id,
        ),
        devfAddedArtificially: boolean('devf_added_artificially').notNull(),
        platziCompletedMandatoryCourses: boolean(
            'platzi_completed_mandatory_courses',
        ).notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            devfBatchGroupId1F2C78B1: index(
                'core_scholarshipmodel_devf_batch_group_id_1f2c78b1',
            ).on(table.devfBatchGroupId),
            currentStatusId9Fe97F52: index(
                'core_scholarshipmodel_current_status_id_9fe97f52',
            ).on(table.currentStatusId),
            studentId7A021Eb0: index('core_scholarshipmodel_student_id_7a021eb0').on(
                table.studentId,
            ),
            convocatoryId73F0A61D: index(
                'core_scholarshipmodel_convocatory_id_73f0a61d',
            ).on(table.convocatoryId),
        };
    },
);

export enum ScholarshipStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    FINISHED = 'FINISHED',
    RESIGNED = 'RESIGNED',
    INACTIVE = 'INACTIVE',
}

export const scholarshipStatusHistoryTable = pgTable(
    'core_scholarshipstatushistorymodel',
    {
        id: serial('id').primaryKey(),
        status: text('status', {
            enum: [
                ScholarshipStatus.ACTIVE,
                ScholarshipStatus.PAUSED,
                ScholarshipStatus.FINISHED,
                ScholarshipStatus.RESIGNED,
                ScholarshipStatus.INACTIVE,
            ],
        }).notNull(),
        observations: text('observations'),
        scholarshipId: integer('scholarship_id')
            .notNull()
            .references((): PgColumn => scholarshipTable.id, {
                onDelete: 'cascade',
            }),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            scholarshipId75F41D42: index(
                'core_scholarshipstatushistorymodel_scholarship_id_75f41d42',
            ).on(table.scholarshipId),
        };
    },
);

export const selectScholarshipSchema = createSelectSchema(scholarshipTable);
export type SelectScholarshipSchema = z.infer<typeof selectScholarshipSchema>;

export const selectScholarshipStatusHistorySchema = createSelectSchema(
    scholarshipStatusHistoryTable,
);
export type SelectScholarshipStatusHistorySchema = z.infer<
    typeof selectScholarshipStatusHistorySchema
>;
