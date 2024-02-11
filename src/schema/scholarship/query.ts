import { schemaBuilder } from '@/schema/schema-builder';
import { ScholarshipRef, ScholarshipStatusRef } from './ref';
import {
    SelectScholarshipSchema,
    scholarshipStatusHistoryTable as scholarshipHistoryTable,
    scholarshipTable,
    selectScholarshipSchema,
} from '@/db/model/scholarship';
import {
    ResolveCursorConnectionArgs,
    resolveCursorConnection,
} from '@pothos/plugin-relay';
import { sql } from 'drizzle-orm';
import { normalize } from 'path';
import { studentProfileTable, userTable } from '@/db/drizzle-schema';

const ScholarshipsFilterRef = schemaBuilder.inputType('ScholarshipsFilter', {
    fields: (t) => ({
        query: t.string({
            required: false,
        }),
        convocatoryIDs: t.intList({
            required: false,
        }),
        collegeIDs: t.intList({
            required: false,
        }),
        statuses: t.field({
            type: [ScholarshipStatusRef],
            required: false,
        }),
    }),
});

schemaBuilder.queryFields((t) => ({
    scholarships: t.connection({
        type: ScholarshipRef,
        args: {
            filter: t.arg({
                type: ScholarshipsFilterRef,
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: (_, args, { DB }) => {
            return resolveCursorConnection(
                {
                    args,
                    toCursor: (scholarship) =>
                        Math.floor(scholarship.createdOn.getTime()).toString(),
                },
                async ({
                    before,
                    after,
                    limit,
                    inverted,
                }: ResolveCursorConnectionArgs) => {
                    const { query, collegeIDs, convocatoryIDs, statuses } = args.filter;

                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT scholarship.* FROM ${scholarshipTable} AS scholarship`;

                    let userHasBeenJoined = false;

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        joins.push(sql`
                            INNER JOIN ${userTable} AS user ON scholarship.user_id = user.id
                        `);
                        userHasBeenJoined = true;

                        whereClauses.push(sql`
                            (user.normalized_first_name LIKE ${fuzzyQuery}
                            OR user.normalized_last_name LIKE ${fuzzyQuery}
                            OR (user.normalized_first_name || ' ' || user.normalized_last_name) LIKE ${fuzzyQuery}
                            OR user.email LIKE ${fuzzyQuery}
                            OR user.phone_code LIKE ${fuzzyQuery}
                            OR user.phone_number LIKE ${fuzzyQuery}
                            OR (user.phone_code || user.phone_number) LIKE ${fuzzyQuery})
                        `);
                    }

                    if (statuses && statuses.length > 0) {
                        joins.push(
                            sql`INNER JOIN ${scholarshipHistoryTable} AS scholarshipHistory ON scholarship.current_status_id = scholarshipHistory.id`,
                        );
                        whereClauses.push(
                            sql`scholarshipHistory.status IN (${sql.join(
                                statuses.map((status) => sql`${status}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (
                        (collegeIDs && collegeIDs.length > 0) ||
                        (convocatoryIDs && convocatoryIDs.length > 0)
                    ) {
                        if (!userHasBeenJoined) {
                            joins.push(sql`
                                INNER JOIN ${userTable} AS user ON scholarship.user_id = user.id
                            `);
                            userHasBeenJoined = true;
                        }

                        joins.push(
                            sql`INNER JOIN ${studentProfileTable} AS student ON user.id = student.user_id`,
                        );

                        // Then, augment this join with additional conditions if necessary
                        if (collegeIDs && collegeIDs.length > 0) {
                            whereClauses.push(
                                sql`student.college_id IN (${sql.join(
                                    collegeIDs.map((id) => sql`${id}`),
                                    sql`, `,
                                )})`,
                            );
                        }
                    }

                    if (convocatoryIDs && convocatoryIDs.length > 0) {
                        whereClauses.push(
                            sql`scholarship.convocatory_id IN (${sql.join(
                                convocatoryIDs.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (before) {
                        whereClauses.push(sql`scholarship.created_on > ${before}`);
                    }

                    if (after) {
                        whereClauses.push(sql`scholarship.created_on < ${after}`);
                    }

                    // Combine all parts into the final statement
                    if (joins.length > 0) {
                        statement = sql`${statement} ${sql.join(joins, sql` `)}`;
                    }
                    if (whereClauses.length > 0) {
                        statement = sql`${statement} WHERE ${sql.join(whereClauses, sql` AND `)}`;
                    }

                    // Append ordering and limit as necessary
                    statement = statement.append(
                        sql` ORDER BY scholarship.created_on ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.run(statement);
                    return result.rows.map((row) => {
                        const next: SelectScholarshipSchema = {
                            id: row.id as number,
                            uuid: row.uuid as string,
                            convocatoryId: row.convocatory_id as number,
                            applicationId: row.postulation_id as number,
                            studentId: row.student_id as number,
                            userId: row.user_id as number,
                            resignDate: new Date(row.resign_date as number),
                            resignInfluences: row.resign_influences as string | null,
                            resignReasons: row.resign_reasons as string | null,
                            resigned: Boolean(row.resigned),
                            askedToRenew: Boolean(row.asked_to_renew),
                            askedToRenewDate: new Date(row.asked_to_renew_date as number),
                            currentStatusId: row.current_status_id as number,
                            devfBatchGroupId: row.devf_batch_group_id as number | null,
                            devfAddedArtificially: Boolean(row.devf_added_artificially),
                            platziCompletedMandatoryCourses: Boolean(
                                row.platzi_completed_mandatory_courses,
                            ),
                            createdOn: new Date(row.created_on as number),
                            modifiedOn: new Date(row.modified_on as number),
                        };

                        return selectScholarshipSchema.parse(next);
                    });
                },
            );
        },
    }),
}));
