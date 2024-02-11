import { sqliteTable, int, index, text, AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { convocatoryTable } from './convocatory';
import { studentProfileTable, userTable } from './user';
import { devfBatchGroupTable } from './devf';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const scholarshipTable = sqliteTable(
    'core_scholarshipmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        uuid: text('uuid').notNull(),
        convocatoryId: int('convocatory_id')
            .notNull()
            .references(() => convocatoryTable.id),
        applicationId: int('postulation_id'),
        // .references(() => applicationTable.id),
        userId: int('user_id')
            .notNull()
            .references(() => userTable.id),
        studentId: int('student_id')
            .notNull()
            .references(() => studentProfileTable.id),
        resignDate: int('resign_date', {
            mode: 'timestamp',
        }),
        resignInfluences: text('resign_influences'),
        resignReasons: text('resign_reasons'),
        resigned: int('resigned', {
            mode: 'boolean',
        }).notNull(),
        askedToRenew: int('asked_to_renew', {
            mode: 'boolean',
        }).notNull(),
        askedToRenewDate: int('asked_to_renew_date', {
            mode: 'timestamp',
        }),
        currentStatusId: int('current_status_id').references(
            (): AnySQLiteColumn => scholarshipStatusHistoryTable.id,
        ),
        devfBatchGroupId: int('devf_batch_group_id').references(
            () => devfBatchGroupTable.id,
        ),
        devfAddedArtificially: int('devf_added_artificially', {
            mode: 'boolean',
        }).notNull(),
        platziCompletedMandatoryCourses: int('platzi_completed_mandatory_courses', {
            mode: 'boolean',
        }).notNull(),
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

export const scholarshipStatusHistoryTable = sqliteTable(
    'core_scholarshipstatushistorymodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
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
        scholarshipId: int('scholarship_id')
            .notNull()
            .references((): AnySQLiteColumn => scholarshipTable.id),
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
