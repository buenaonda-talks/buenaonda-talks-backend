import {
    ScholarshipStatus,
    SelectScholarshipSchema,
    SelectScholarshipStatusHistorySchema,
} from '@/db/model/scholarship';

import { schemaBuilder } from '@/schema/schema-builder';
import { UserRef } from '../user';
import { selectUsersSchema } from '@/db/drizzle-schema';

export const ScholarshipRef =
    schemaBuilder.objectRef<SelectScholarshipSchema>('Scholarship');
schemaBuilder.objectType(ScholarshipRef, {
    description: 'Representation of a scholarship form field option',
    fields: (t) => ({
        id: t.exposeID('id'),

        createdOn: t.field({
            type: 'DateTime',
            resolve: (scholarship) => scholarship.createdOn,
        }),

        uuid: t.exposeString('uuid'),
        convocatoryId: t.exposeID('convocatoryId'),
        applicationid: t.exposeID('applicationId', {
            nullable: true,
        }),
        studentId: t.exposeID('studentId'),
        userId: t.exposeID('userId'),

        user: t.field({
            type: UserRef,
            resolve: async (scholarship, _args, { DB }) => {
                const { userId } = scholarship;
                const user = await DB.query.userTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, userId);
                    },
                });

                if (!user) {
                    throw new Error('User not found');
                }

                return selectUsersSchema.parse(user);
            },
        }),

        resignDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (scholarship) => scholarship.resignDate,
        }),
        resignInfluences: t.exposeString('resignInfluences', {
            nullable: true,
        }),
        resignReasons: t.exposeString('resignReasons', {
            nullable: true,
        }),
        resigned: t.exposeBoolean('resigned'),
        askedToRenew: t.exposeBoolean('askedToRenew'),
        askedToRenewDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (scholarship) => scholarship.askedToRenewDate,
        }),
        currentStatusid: t.exposeID('currentStatusId', {
            nullable: true,
        }),
        devfBatchGroupid: t.exposeID('devfBatchGroupId', {
            nullable: true,
        }),
        devfAddedArtificially: t.exposeBoolean('devfAddedArtificially'),
        platziCompletedMandatoryCourses: t.exposeBoolean(
            'platziCompletedMandatoryCourses',
        ),

        currentStatus: t.field({
            type: ScholarshipStatusHistoryRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const { currentStatusId } = parent;
                if (!currentStatusId) {
                    return null;
                }

                const history = await DB.query.scholarshipStatusHistoryTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, currentStatusId);
                    },
                });

                if (!history) {
                    return null;
                }

                return history;
            },
        }),
    }),
});

export const ScholarshipStatusRef = schemaBuilder.enumType(ScholarshipStatus, {
    name: 'ScholarshipStatus',
});

export const ScholarshipStatusHistoryRef =
    schemaBuilder.objectRef<SelectScholarshipStatusHistorySchema>(
        'ScholarshipStatusHistory',
    );
schemaBuilder.objectType(ScholarshipStatusHistoryRef, {
    description: 'Representation of a scholarship form field option',
    fields: (t) => ({
        id: t.exposeID('id'),
        status: t.field({
            type: ScholarshipStatusRef,
            resolve: (history) => history.status,
        }),
        observations: t.exposeString('observations', {
            nullable: true,
        }),
        scholarshipid: t.exposeID('scholarshipId'),
    }),
});
