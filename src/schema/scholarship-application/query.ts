import {
    applicationTable,
    selectApplicationSchema,
    applicationHistoryTable,
} from '@/db/model/scholarship-application';
import { schemaBuilder } from '../schema-builder';
import { ApplicationRef } from './ref';
import { sql } from 'drizzle-orm';
import { formTable, studentProfileTable, userTable } from '@/db/drizzle-schema';
import {
    ResolveCursorConnectionArgs,
    resolveCursorConnection,
} from '@pothos/plugin-relay';
import { ApplicationStatusRef } from '../scholarship-form';
import { normalize } from '@/utils';

const ApplicationsFilterRef = schemaBuilder.inputType('ApplicationsFilter', {
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
            type: [ApplicationStatusRef],
            required: false,
        }),
    }),
});

schemaBuilder.queryFields((t) => ({
    applications: t.connection({
        type: ApplicationRef,
        args: {
            filter: t.arg({
                type: ApplicationsFilterRef,
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
                    toCursor: (application) => application.createdOn.toString(),
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
                    let statement = sql`SELECT application.* FROM ${applicationTable} AS application`;

                    let userHasBeenJoined = false;

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        joins.push(sql`
                            INNER JOIN ${userTable} AS user ON application.user_id = user.id
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
                            sql`INNER JOIN ${applicationHistoryTable} AS applicationHistory ON application.current_status_id = applicationHistory.id`,
                        );
                        whereClauses.push(
                            sql`applicationHistory.status IN (${sql.join(
                                statuses.map((status) => sql`${status}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (collegeIDs && collegeIDs.length > 0) {
                        if (!userHasBeenJoined) {
                            joins.push(sql`
                                    INNER JOIN ${userTable} AS user ON application.user_id = user.id
                                `);
                            userHasBeenJoined = true;
                        }

                        joins.push(
                            sql`INNER JOIN ${studentProfileTable} AS student ON user.id = student.user_id`,
                        );

                        whereClauses.push(
                            sql`student.college_id IN (${sql.join(
                                collegeIDs.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (convocatoryIDs && convocatoryIDs.length > 0) {
                        joins.push(sql`
                            INNER JOIN ${formTable} AS form ON application.form_id = form.id
                        `);

                        whereClauses.push(
                            sql`form.convocatory_id IN (${sql.join(
                                convocatoryIDs.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (before) {
                        whereClauses.push(
                            sql`application.created_on > ${new Date(before).toISOString()}`,
                        );
                    }

                    if (after) {
                        whereClauses.push(
                            sql`application.created_on < ${new Date(after).toISOString()}`,
                        );
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
                        sql` ORDER BY application.created_on ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.execute(statement);
                    return result.map((row) => {
                        return selectApplicationSchema.parse({
                            id: row.id,
                            acceptedTerms:
                                typeof row.accepted_terms === 'number'
                                    ? row.accepted_terms === 1
                                    : null,
                            termsAcceptanceDate:
                                typeof row.terms_acceptance_date === 'number'
                                    ? new Date(row.terms_acceptance_date)
                                    : null,
                            formId: row.form_id,
                            studentId: row.student_id,
                            userId: row.user_id,
                            uuid: row.uuid,
                            currentStatusId: row.current_status_id,
                            resultNotificationViaEmailStatus:
                                row.result_notification_via_email_status,
                            createdOn: new Date(row.created_on as number),
                            modifiedOn: new Date(row.modified_on as number),
                        });
                    });
                },
            );
        },
    }),
    applicationById: t.field({
        type: ApplicationRef,
        nullable: true,
        args: {
            id: t.arg.int({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (_, args, { DB }) => {
            const application = await DB.query.applicationTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, args.id);
                },
            });

            if (!application) {
                return null;
            }

            return selectApplicationSchema.parse(application);
        },
    }),
}));
