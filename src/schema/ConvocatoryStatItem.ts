import {
    ScholarshipConvocatoryKind,
    SelectConvocatorySchema,
    applicationHistoryTable,
    applicationTable,
    convocatoryTable,
    formTable,
    scholarshipTable,
    selectConvocatorySchema,
    studentProfileTable,
    talkInscriptionTable,
    talkTable,
    userTable,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { eq, and, sql } from 'drizzle-orm';
import { ApplicationStatus } from '@/db/shared';
import { alias } from 'drizzle-orm/pg-core';
import dayjs from 'dayjs';

export type AdminStatsItemScholarshipByConvocatory = {
    convocatory: SelectConvocatorySchema;
    scholarships: number;
    scholarshipsWithdrawn: number;
};

export type AdminStatsItemPostulationStatusDataItem = {
    reason: string;
    count: number;
};

export type AdminStatsItem = {
    convocatory: SelectConvocatorySchema;
    addedStudents: number;
    signedUpStudents: number;
    talkInscriptions: number;
    talkAssistants: number;
    postulationSubmissions: number;
    postulationSubmissionsAccepted: number;
    postulationSubmissionsRejected: AdminStatsItemPostulationStatusDataItem[];
    postulationSubmissionsPending: AdminStatsItemPostulationStatusDataItem[];
    postulationSubmissionsAcceptedTerms: number;
    postulationSubmissionsRejectedTerms: number;
    postulationSubmissionsPendingTerms: number;
    postulationSubmissionsUnansweredTerms: number;
    scholarships: number;
    scholarshipsWithdrawn: number;
    scholarshipsFinished: number;
    scholarshipsStudying: number;
    scholarshipsByConvocatorySource: AdminStatsItemScholarshipByConvocatory[];
};

const minDate = (date: Date) => {
    return dayjs(date)
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .add(0, 'hours')
        .add(1, 'day')
        .toDate();
};

const maxDate = (date: Date) => {
    return dayjs(date)
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .add(0, 'hours')
        .add(1, 'day')
        .toDate();
};

class ConvocatoryStatItem {
    private DB: YogaContext['DB'];
    private convocatory: SelectConvocatorySchema;

    constructor(DB: YogaContext['DB'], convocatory: SelectConvocatorySchema) {
        this.DB = DB;
        this.convocatory = convocatory;
    }

    public async getStats(): Promise<AdminStatsItem> {
        const [
            comprehensiveStats,
            scholarshipsByConvocatorySource,
            getPostulationSubmissionsPendingItems,
            getPostulationSubmissionsRejectedItems,
        ] = await Promise.all([
            this.gatherComprehensiveStats(),
            this.getScholarshipsByConvocatorySourceItems(),
            this.getPostulationSubmissionsPendingItems(),
            this.getPostulationSubmissionsRejectedItems(),
        ]);

        const result: AdminStatsItem = {
            convocatory: this.convocatory,

            addedStudents: comprehensiveStats.studentStats.addedStudents,
            signedUpStudents: comprehensiveStats.studentStats.signedUpStudents,

            talkAssistants: comprehensiveStats.talkStats.assistants,
            talkInscriptions: comprehensiveStats.talkStats.inscriptions,

            postulationSubmissions: [
                comprehensiveStats.postulationStats.accepted,
                comprehensiveStats.postulationStats.acceptedTerms,
                comprehensiveStats.postulationStats.unansweredTerms,
                comprehensiveStats.postulationStats.rejectedTerms,
                comprehensiveStats.postulationStats.pendingTerms,
                comprehensiveStats.postulationStats.submitted,
                comprehensiveStats.postulationStats.declined,
            ].reduce((a, b) => a + b, 0),
            postulationSubmissionsAccepted: [
                comprehensiveStats.postulationStats.accepted,
                comprehensiveStats.postulationStats.acceptedTerms,
                comprehensiveStats.postulationStats.unansweredTerms,
                comprehensiveStats.postulationStats.rejectedTerms,
                // countPostulationSubmissionsByStatus.pendingTerms,
            ].reduce((a, b) => a + b, 0),
            postulationSubmissionsAcceptedTerms:
                comprehensiveStats.postulationStats.acceptedTerms,
            postulationSubmissionsPending: getPostulationSubmissionsPendingItems,
            postulationSubmissionsPendingTerms:
                comprehensiveStats.postulationStats.pendingTerms,
            postulationSubmissionsRejected: getPostulationSubmissionsRejectedItems,
            postulationSubmissionsRejectedTerms:
                comprehensiveStats.postulationStats.rejectedTerms,
            postulationSubmissionsUnansweredTerms:
                comprehensiveStats.postulationStats.unansweredTerms,
            scholarships: comprehensiveStats.scholarships.count,
            scholarshipsByConvocatorySource: scholarshipsByConvocatorySource,
            scholarshipsFinished: comprehensiveStats.scholarships.finished,
            scholarshipsStudying: this.countScholarshipsStudying(),
            scholarshipsWithdrawn: comprehensiveStats.scholarships.withdrawn,
        };

        return result;
    }

    private async getPostulationSubmissionsRejectedItems(): Promise<
        AdminStatsItemPostulationStatusDataItem[]
    > {
        const result = await this.DB.select({
            observations: applicationHistoryTable.observations,
        })
            .from(applicationTable)
            .innerJoin(formTable, eq(formTable.id, applicationTable.formId))
            .innerJoin(
                applicationHistoryTable,
                eq(applicationHistoryTable.submissionId, applicationTable.id),
            )
            .where(
                and(
                    eq(applicationHistoryTable.status, ApplicationStatus.DECLINED),
                    eq(formTable.convocatoryId, this.convocatory.id),
                ),
            )
            .then((result) => {
                return result.reduce((acc, item) => {
                    const reason = item.observations || 'Motivo no especificado';
                    const itemIndex = acc.findIndex((i) => i.reason === reason);
                    if (itemIndex === -1) {
                        acc.push({
                            reason,
                            count: 1,
                        });
                    } else {
                        acc[itemIndex].count += 1;
                    }
                    return acc;
                }, [] as AdminStatsItemPostulationStatusDataItem[]);
            });

        return result;
    }

    private async getPostulationSubmissionsPendingItems(): Promise<
        AdminStatsItemPostulationStatusDataItem[]
    > {
        const result = await this.DB.select({
            observations: applicationHistoryTable.observations,
        })
            .from(applicationTable)
            .innerJoin(formTable, eq(formTable.id, applicationTable.formId))
            .innerJoin(
                applicationHistoryTable,
                eq(applicationHistoryTable.submissionId, applicationTable.id),
            )
            .where(
                and(
                    eq(applicationHistoryTable.status, ApplicationStatus.PENDING),
                    eq(formTable.convocatoryId, this.convocatory.id),
                ),
            )
            .then((result) => {
                return result.reduce((acc, item) => {
                    const reason = item.observations || 'Motivo no especificado';
                    const itemIndex = acc.findIndex((i) => i.reason === reason);
                    if (itemIndex === -1) {
                        acc.push({
                            reason,
                            count: 1,
                        });
                    } else {
                        acc[itemIndex].count += 1;
                    }
                    return acc;
                }, [] as AdminStatsItemPostulationStatusDataItem[]);
            });

        return result;
    }

    private async getScholarshipsByConvocatorySourceItems(): Promise<
        AdminStatsItemScholarshipByConvocatory[]
    > {
        if (
            this.convocatory.kind === ScholarshipConvocatoryKind.DEVF &&
            !['G-23', 'G-22', 'G-21'].includes(this.convocatory.privateLabel)
        ) {
            // Alias for self-joining the scholarship table
            const platziScholarship = alias(scholarshipTable, 'platziScholarship');
            const platziConvocatory = alias(convocatoryTable, 'platziConvocatory');

            // Executing the query
            const rows = await this.DB.select({
                devFScholarship: scholarshipTable,
                platziScholarship,
                platziConvocatory,
            })
                .from(scholarshipTable)
                .leftJoin(
                    platziScholarship,
                    eq(platziScholarship.userId, scholarshipTable.userId),
                )
                .leftJoin(
                    platziConvocatory,
                    eq(platziScholarship.convocatoryId, platziConvocatory.id),
                )
                .where(
                    and(
                        eq(scholarshipTable.convocatoryId, this.convocatory.id),
                        eq(platziConvocatory.kind, ScholarshipConvocatoryKind.PLATZI),
                    ),
                )
                .execute();

            const aggregatedResults = rows.reduce(
                (acc, row) => {
                    if (!row.platziScholarship) {
                        return acc;
                    }

                    const platziconvocatoryId = row.platziScholarship.convocatoryId;
                    if (!acc[platziconvocatoryId]) {
                        acc[platziconvocatoryId] = {
                            convocatory: selectConvocatorySchema.parse(
                                row.platziConvocatory,
                            ),
                            scholarships: 0,
                            scholarshipsWithdrawn: 0,
                        };
                    }

                    acc[platziconvocatoryId].scholarships++;
                    if (row.platziScholarship.resigned) {
                        acc[platziconvocatoryId].scholarshipsWithdrawn++;
                    }
                    return acc;
                },
                {} as Record<number, AdminStatsItemScholarshipByConvocatory>,
            );

            return Object.values(aggregatedResults);
        }

        return [];
    }

    private countScholarshipsStudying(): number {
        return this.convocatory.devfInformedStudying || 0;
    }

    private async gatherComprehensiveStats(): Promise<{
        postulationStats: {
            accepted: number;
            acceptedTerms: number;
            rejectedTerms: number;
            pendingTerms: number;
            unansweredTerms: number;
            submitted: number;
            declined: number;
        };
        talkStats: {
            inscriptions: number;
            assistants: number;
        };
        studentStats: {
            addedStudents: number;
            signedUpStudents: number;
        };
        scholarships: {
            count: number;
            finished: number;
            withdrawn: number;
        };
    }> {
        const statement = sql`
        SELECT
            -- Postulation status counts
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.ACCEPTED} THEN 1 ELSE 0 END) AS accepted,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.ACCEPTED_TERMS} THEN 1 ELSE 0 END) AS accepted_terms,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.DECLINED_TERMS} THEN 1 ELSE 0 END) AS rejected_terms,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.PENDING} THEN 1 ELSE 0 END) AS pending_terms,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.TERMS_UNANSWERED} THEN 1 ELSE 0 END) AS unanswered_terms,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.SUBMITTED} THEN 1 ELSE 0 END) AS submitted,
            SUM(CASE WHEN application_history.status = ${ApplicationStatus.DECLINED} THEN 1 ELSE 0 END) AS declined,

        -- Talk statistics
        (SELECT COUNT(*) FROM ${talkInscriptionTable} AS talk_inscription1 JOIN ${talkTable} AS talk1 ON talk_inscription1.talk_id = talk1.id WHERE talk1.convocatory_id = ${this.convocatory.id}) AS inscriptions,
        (SELECT COUNT(*) FROM ${talkInscriptionTable} AS talk_inscription2 JOIN ${talkTable} AS talk2 ON talk_inscription2.talk_id = talk2.id WHERE talk_inscription2.assisted = TRUE AND talk2.convocatory_id = ${this.convocatory.id}) AS assistants,

        -- Scholarship statistics
        `;

        if (this.convocatory.kind === ScholarshipConvocatoryKind.DEVF) {
            statement.append(
                sql`${this.convocatory.devfInformedGraduates || 0} AS scholarship_finished,`,
            );
        } else {
            statement.append(
                sql`(SELECT COUNT(*) FROM ${scholarshipTable} AS scholarship3 WHERE scholarship3.convocatory_id = ${this.convocatory.id} AND scholarship3.platzi_completed_mandatory_courses = TRUE) AS scholarship_finished,`,
            );
        }

        if (
            this.convocatory.kind === ScholarshipConvocatoryKind.DEVF &&
            this.convocatory.devfInformedResigned
        ) {
            statement.append(
                sql`${this.convocatory.devfInformedResigned} AS scholarships_withdrawn,`,
            );
        } else {
            statement.append(
                sql`(SELECT COUNT(*) FROM ${scholarshipTable} AS scholarship4 WHERE scholarship4.convocatory_id = ${this.convocatory.id} AND scholarship4.resigned = TRUE) AS scholarships_withdrawn,`,
            );
        }

        const devFScholarshipsCount =
            [
                this.convocatory.devfInformedGraduates,
                this.convocatory.devfInformedResigned,
                this.convocatory.devfInformedStudying,
                this.convocatory.devfInformedNotAssisted,
            ].reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
        if (devFScholarshipsCount > 0) {
            statement.append(sql`${devFScholarshipsCount} AS scholarships_count,`);
        } else {
            statement.append(
                sql`(SELECT COUNT(*) FROM ${scholarshipTable} AS scholarship5 WHERE scholarship5.convocatory_id = ${this.convocatory.id}) AS scholarships_count,`,
            );
        }

        const { countAddingsFromDate, countAddingsTillDate } = this.convocatory;
        statement.append(sql`-- Student statistics`);
        if (countAddingsFromDate && countAddingsTillDate) {
            const min = minDate(countAddingsFromDate);
            const max = maxDate(countAddingsTillDate);
            statement.append(sql`
                (SELECT COUNT(*) FROM ${studentProfileTable} student_profile JOIN ${userTable} u ON student_profile.user_id = u.id WHERE u.date_joined BETWEEN ${min} AND ${max}) AS added_students,
                (SELECT COUNT(*) FROM ${studentProfileTable} student_profile WHERE student_profile.signup_datetime BETWEEN ${min} AND ${max}) AS signed_up_students
            `);
        } else {
            statement.append(sql`
                0 AS added_students,
                0 AS signed_up_students
            `);
        }

        statement.append(sql`
            FROM ${applicationHistoryTable} AS application_history
            INNER JOIN ${applicationTable} AS application ON application.id = application_history.submission_id AND application.current_status_id = application_history.id
            INNER JOIN ${formTable} AS form ON form.id = application.form_id
            WHERE form.convocatory_id = ${this.convocatory.id}
        `);

        const result = (await this.DB.execute(statement).then((result) => result[0])) as {
            accepted: number;
            accepted_terms: number;
            rejected_terms: number;
            pending_terms: number;
            unanswered_terms: number;
            submitted: number;
            declined: number;
            inscriptions: number;
            assistants: number;
            added_students: number;
            signed_up_students: number;
            scholarships_count: number;
            scholarship_finished: number;
            scholarships_withdrawn: number;
        };

        return {
            postulationStats: {
                accepted: parseInt(result.accepted.toString(), 10),
                acceptedTerms: parseInt(result.accepted_terms.toString(), 10),
                rejectedTerms: parseInt(result.rejected_terms.toString(), 10),
                pendingTerms: parseInt(result.pending_terms.toString(), 10),
                unansweredTerms: parseInt(result.unanswered_terms.toString(), 10),
                submitted: parseInt(result.submitted.toString(), 10),
                declined: parseInt(result.declined.toString(), 10),
            },
            talkStats: {
                inscriptions: parseInt(result.inscriptions.toString(), 10),
                assistants: parseInt(result.assistants.toString(), 10),
            },
            studentStats: {
                addedStudents: parseInt(result.added_students.toString(), 10),
                signedUpStudents: parseInt(result.signed_up_students.toString(), 10),
            },
            scholarships: {
                count: parseInt(result.scholarships_count.toString(), 10),
                finished: parseInt(result.scholarship_finished.toString(), 10),
                withdrawn: parseInt(result.scholarships_withdrawn.toString(), 10),
            },
        };
    }
}

export default ConvocatoryStatItem;
