import {
    applicationTable,
    studentProfileTable,
    talkInscriptionTable,
    talkTable,
    userTable,
} from '@/db/drizzle-schema';
import { schemaBuilder } from './schema-builder';
import { ConvocatoryRef } from './convocatory';
import { count, eq, and, gte, lte, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import ConvocatoryStatItem, {
    AdminStatsItem,
    AdminStatsItemPostulationStatusDataItem,
    AdminStatsItemScholarshipByConvocatory,
} from './ConvocatoryStatItem';

type AdminStats = {
    stats: AdminStatsItem[];
    maxDevfScholarships: number;
    maxPlatziScholarships: number;
    studentsCount: number;
    assistancesToTalks: number;
    postulationSubmissionsCount: number;
    scholarshipsCount: number;
};

const AdminStatsItemScholarshipByConvocatoryRef =
    schemaBuilder.objectRef<AdminStatsItemScholarshipByConvocatory>(
        'AdminStatsItemScholarshipByConvocatory',
    );
AdminStatsItemScholarshipByConvocatoryRef.implement({
    description: 'Admin stats item scholarship by convocatory',
    fields: (t) => ({
        convocatory: t.field({
            type: ConvocatoryRef,
            nullable: false,
            resolve: (adminStatsItemScholarshipByConvocatory) =>
                adminStatsItemScholarshipByConvocatory.convocatory,
        }),
        scholarships: t.int({
            nullable: false,
            resolve: (adminStatsItemScholarshipByConvocatory) =>
                adminStatsItemScholarshipByConvocatory.scholarships,
        }),
        scholarshipsWithdrawn: t.int({
            nullable: false,
            resolve: (adminStatsItemScholarshipByConvocatory) =>
                adminStatsItemScholarshipByConvocatory.scholarshipsWithdrawn,
        }),
    }),
});

const AdminStatsItemPostulationStatusDataItemRef =
    schemaBuilder.objectRef<AdminStatsItemPostulationStatusDataItem>(
        'AdminStatsItemPostulationStatusDataItem',
    );
AdminStatsItemPostulationStatusDataItemRef.implement({
    description: 'Admin stats item postulation status data item',
    fields: (t) => ({
        reason: t.field({
            type: 'String',
            nullable: false,
            resolve: (adminStatsItemPostulationStatusDataItem) =>
                adminStatsItemPostulationStatusDataItem.reason,
        }),
        count: t.field({
            type: 'Int',
            nullable: false,
            resolve: (adminStatsItemPostulationStatusDataItem) =>
                adminStatsItemPostulationStatusDataItem.count,
        }),
    }),
});

const AdminStatsItemRef = schemaBuilder.objectRef<AdminStatsItem>('AdminStatsItem');
AdminStatsItemRef.implement({
    description: 'Admin stats item',
    fields: (t) => ({
        convocatory: t.field({
            type: ConvocatoryRef,
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.convocatory,
        }),
        addedStudents: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.addedStudents,
        }),
        signedUpStudents: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.signedUpStudents,
        }),
        talkInscriptions: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.talkInscriptions,
        }),
        talkAssistants: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.talkAssistants,
        }),
        postulationSubmissions: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.postulationSubmissions,
        }),
        postulationSubmissionsAccepted: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.postulationSubmissionsAccepted,
        }),
        postulationSubmissionsRejected: t.field({
            type: [AdminStatsItemPostulationStatusDataItemRef],
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.postulationSubmissionsRejected,
        }),
        postulationSubmissionsPending: t.field({
            type: [AdminStatsItemPostulationStatusDataItemRef],
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.postulationSubmissionsPending,
        }),
        postulationSubmissionsAcceptedTerms: t.int({
            nullable: false,
            resolve: (adminStatsItem) =>
                adminStatsItem.postulationSubmissionsAcceptedTerms,
        }),
        postulationSubmissionsRejectedTerms: t.int({
            nullable: false,
            resolve: (adminStatsItem) =>
                adminStatsItem.postulationSubmissionsRejectedTerms,
        }),
        postulationSubmissionsPendingTerms: t.int({
            nullable: false,
            resolve: (adminStatsItem) =>
                adminStatsItem.postulationSubmissionsPendingTerms,
        }),
        postulationSubmissionsUnansweredTerms: t.int({
            nullable: false,
            resolve: (adminStatsItem) =>
                adminStatsItem.postulationSubmissionsUnansweredTerms,
        }),
        scholarships: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.scholarships,
        }),
        scholarshipsWithdrawn: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.scholarshipsWithdrawn,
        }),
        scholarshipsFinished: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.scholarshipsFinished,
        }),
        scholarshipsStudying: t.int({
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.scholarshipsStudying,
        }),
        scholarshipsByConvocatorySource: t.field({
            type: [AdminStatsItemScholarshipByConvocatoryRef],
            nullable: false,
            resolve: (adminStatsItem) => adminStatsItem.scholarshipsByConvocatorySource,
        }),
    }),
});

const AdminStatsRef = schemaBuilder.objectRef<AdminStats>('AdminStats');
AdminStatsRef.implement({
    description: 'Admin stats',
    fields: (t) => ({
        stats: t.field({
            type: [AdminStatsItemRef],
            nullable: false,
            resolve: (adminStats) => adminStats.stats,
        }),
        maxDevfScholarships: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.maxDevfScholarships,
        }),
        maxPlatziScholarships: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.maxPlatziScholarships,
        }),
        studentsCount: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.studentsCount,
        }),
        assistancesToTalks: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.assistancesToTalks,
        }),
        postulationSubmissionsCount: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.postulationSubmissionsCount,
        }),
        scholarshipsCount: t.int({
            nullable: false,
            resolve: (adminStats) => adminStats.scholarshipsCount,
        }),
    }),
});

type AdminStudentsCountByDateItem = {
    date: Date;
    count: number;
};

type AdminStudentsCountByDate = {
    joinedAtItems: AdminStudentsCountByDateItem[];
    signedUpAtItems: AdminStudentsCountByDateItem[];
};

const AdminStudentsCountByDateItemRef =
    schemaBuilder.objectRef<AdminStudentsCountByDateItem>('AdminStudentsCountByDateItem');
AdminStudentsCountByDateItemRef.implement({
    description: 'Admin students count by date item',
    fields: (t) => ({
        date: t.field({
            type: 'Date',
            nullable: false,
            resolve: (adminStudentsCountByDateItem) => adminStudentsCountByDateItem.date,
        }),
        count: t.field({
            type: 'Int',
            nullable: false,
            resolve: (adminStudentsCountByDateItem) => adminStudentsCountByDateItem.count,
        }),
    }),
});

const AdminStudentsCountByDateRef = schemaBuilder.objectRef<AdminStudentsCountByDate>(
    'AdminStudentsCountByDate',
);
AdminStudentsCountByDateRef.implement({
    description: 'Admin students count by date',
    fields: (t) => ({
        joinedAtItems: t.field({
            type: [AdminStudentsCountByDateItemRef],
            nullable: false,
            resolve: (adminStudentsCountByDate) => adminStudentsCountByDate.joinedAtItems,
        }),
        signedUpAtItems: t.field({
            type: [AdminStudentsCountByDateItemRef],
            nullable: false,
            resolve: (adminStudentsCountByDate) =>
                adminStudentsCountByDate.signedUpAtItems,
        }),
    }),
});

schemaBuilder.queryFields((t) => ({
    adminStats: t.field({
        type: AdminStatsRef,
        args: {
            convocatory: t.arg({
                type: 'Int',
                required: false,
            }),
        },
        authz: {
            rules: [],
        },
        nullable: false,
        resolve: async (root, args, { DB }) => {
            const convocatoryId = args.convocatory;
            const convocatories = await DB.query.convocatoryTable.findMany({
                where: (fields, operators) => {
                    if (convocatoryId) {
                        return operators.eq(fields.id, convocatoryId);
                    }

                    return undefined;
                },
            });

            const stats = await Promise.all(
                convocatories.map((convocatory) => {
                    const item = new ConvocatoryStatItem(DB, convocatory);
                    return item.getStats();
                }),
            );

            const maxDevfScholarships = 300;
            const maxPlatziScholarships = 100;
            let studentsCount = 0;
            let assistancesToTalks = 0;
            let postulationSubmissionsCount = 0;

            if (convocatoryId) {
                const convocatory = convocatories.length > 0 ? convocatories[0] : null;
                const countAddingsFromDate = convocatory?.countAddingsFromDate
                    ? new Date(convocatory.countAddingsFromDate)
                    : null;
                const countAddingsTillDate = convocatory?.countAddingsTillDate
                    ? new Date(convocatory.countAddingsTillDate)
                    : null;

                if (countAddingsFromDate && countAddingsTillDate) {
                    studentsCount =
                        (
                            await DB.select({
                                value: count(),
                            })
                                .from(studentProfileTable)
                                .innerJoin(
                                    userTable,
                                    eq(userTable.id, studentProfileTable.userId),
                                )
                                .where(
                                    and(
                                        gte(userTable.dateJoined, countAddingsFromDate),
                                        lte(userTable.dateJoined, countAddingsTillDate),
                                    ),
                                )
                                .then((res) => res[0])
                        )?.value || 0;
                }

                assistancesToTalks =
                    (
                        await DB.select({
                            value: count(),
                        })
                            .from(talkInscriptionTable)
                            .innerJoin(
                                talkTable,
                                eq(talkTable.id, talkInscriptionTable.talkId),
                            )
                            .where(
                                and(
                                    eq(talkTable.convocatoryId, convocatoryId),
                                    eq(talkInscriptionTable.assisted, true),
                                ),
                            )
                            .then((res) => res[0])
                    )?.value || 0;

                const formId = await DB.query.formTable
                    .findFirst({
                        where: (fields, operators) =>
                            operators.eq(fields.convocatoryId, convocatoryId),
                    })
                    .then((form) => form?.id);

                postulationSubmissionsCount = formId
                    ? await DB.select({
                          value: count(),
                      })
                          .from(applicationTable)
                          .where(eq(applicationTable.formId, formId))
                          .then((res) => res[0])
                          .then((result) => result?.value || 0)
                    : 0;
            } else {
                studentsCount = await DB.select({
                    value: count(),
                })
                    .from(studentProfileTable)
                    .then((res) => res[0])
                    .then((result) => result?.value || 0);

                assistancesToTalks = await DB.select({
                    value: count(),
                })
                    .from(talkInscriptionTable)
                    .where(eq(talkInscriptionTable.assisted, true))
                    .then((res) => res[0])
                    .then((result) => result?.value || 0);

                postulationSubmissionsCount = await DB.select({
                    value: count(),
                })
                    .from(applicationTable)
                    .then((res) => res[0])
                    .then((result) => result?.value || 0);
            }

            return {
                stats,
                maxDevfScholarships,
                maxPlatziScholarships,
                studentsCount,
                assistancesToTalks,
                postulationSubmissionsCount,
                scholarshipsCount: stats.reduce(
                    (acc, item) => acc + item.scholarships,
                    0,
                ),
            };
        },
    }),
    adminStudentsCountByDate: t.field({
        type: AdminStudentsCountByDateRef,
        args: {
            convocatory: t.arg({
                type: 'Int',
                required: false,
            }),
            startDate: t.arg({
                type: 'Date',
                required: false,
            }),
            endDate: t.arg({
                type: 'Date',
                required: false,
            }),
        },
        nullable: false,
        resolve: async (root, args, { DB }) => {
            const startDate = args.startDate;
            const endDate = args.endDate;

            const minDatetime = startDate
                ? new Date(startDate.setHours(0, 0, 0, 0))
                : null;
            const maxDatetime = endDate
                ? new Date(endDate.setHours(23, 59, 59, 999))
                : null;

            const userAlias = alias(userTable, 'user');

            const query = DB.select()
                .from(studentProfileTable)
                .innerJoin(userAlias, eq(userAlias.id, studentProfileTable.userId));

            if (minDatetime && maxDatetime) {
                query.where(
                    or(
                        and(
                            eq(userAlias.dateJoined, minDatetime),
                            eq(userAlias.dateJoined, maxDatetime),
                        ),
                        and(
                            eq(studentProfileTable.signupDatetime, minDatetime),
                            eq(studentProfileTable.signupDatetime, maxDatetime),
                        ),
                    ),
                );
            }

            const rows = await query.execute();

            const joinedAtItems: AdminStudentsCountByDateItem[] = [];
            const signedUpAtItems: AdminStudentsCountByDateItem[] = [];

            for (const item of rows) {
                const dateJoined = new Date(item.user.dateJoined);
                const dateSignedUp = item.generations_studentmodel.signupDatetime
                    ? new Date(item.generations_studentmodel.signupDatetime)
                    : null;

                if (minDatetime && maxDatetime) {
                    if (dateJoined >= minDatetime && dateJoined <= maxDatetime) {
                        const joinedAtItem = joinedAtItems.find(
                            (item) => item.date.getTime() === dateJoined.getTime(),
                        );

                        if (joinedAtItem) {
                            joinedAtItem.count++;
                        } else {
                            joinedAtItems.push({
                                date: dateJoined,
                                count: 1,
                            });
                        }
                    }

                    if (
                        dateSignedUp &&
                        dateSignedUp >= minDatetime &&
                        dateSignedUp <= maxDatetime
                    ) {
                        const signedUpAtItem = signedUpAtItems.find(
                            (item) => item.date.getTime() === dateSignedUp.getTime(),
                        );

                        if (signedUpAtItem) {
                            signedUpAtItem.count++;
                        } else {
                            signedUpAtItems.push({
                                date: dateSignedUp,
                                count: 1,
                            });
                        }
                    }
                }
            }

            return {
                joinedAtItems,
                signedUpAtItems,
            };
        },
    }),
}));
