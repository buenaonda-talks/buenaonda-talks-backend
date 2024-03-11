import {
    ResolveCursorConnectionArgs,
    resolveCursorConnection,
} from '@pothos/plugin-relay';
import { schemaBuilder } from '../schema-builder';
import { CollegeRef } from './ref';
import {
    collegeTable,
    selectCollegeSchema,
    communeTable,
    SelectCollegeSchema,
} from '@/db/drizzle-schema';
import { sql } from 'drizzle-orm';
import { normalize } from '@/utils';

const CollegesFilterRef = schemaBuilder.inputType('CollegesFilter', {
    fields: (t) => ({
        query: t.string({
            required: false,
        }),
        regionsIDs: t.intList({
            required: false,
        }),
        communeIDs: t.intList({
            required: false,
        }),
    }),
});

schemaBuilder.queryFields((t) => ({
    colleges: t.field({
        type: [CollegeRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.collegeTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCollegeSchema.parse(u));
        },
    }),
    collegesCursor: t.connection({
        type: CollegeRef,
        args: {
            filter: t.arg({
                type: CollegesFilterRef,
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
                    toCursor: (college) =>
                        Math.floor(college.createdOn.getTime()).toString(),
                },
                async ({
                    before,
                    after,
                    limit,
                    inverted,
                }: ResolveCursorConnectionArgs) => {
                    const { query, regionsIDs, communeIDs } = args.filter;

                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT college.* FROM ${collegeTable} AS college`;

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        whereClauses.push(sql`
                            college.normalized_name LIKE ${fuzzyQuery}
                        `);
                    }

                    if (
                        (regionsIDs && regionsIDs.length > 0) ||
                        (communeIDs && communeIDs.length > 0)
                    ) {
                        joins.push(
                            sql`INNER JOIN ${communeTable} AS commune ON college.commune_id = commune.id`,
                        );

                        if (regionsIDs && regionsIDs.length > 0) {
                            whereClauses.push(
                                sql`commune.region_id IN (${sql.join(
                                    regionsIDs.map((id) => sql`${id}`),
                                    sql`, `,
                                )})`,
                            );
                        }

                        if (communeIDs && communeIDs.length > 0) {
                            whereClauses.push(
                                sql`college.commune_id IN (${sql.join(
                                    communeIDs.map((id) => sql`${id}`),
                                    sql`, `,
                                )})`,
                            );
                        }
                    }

                    if (before) {
                        whereClauses.push(sql`college.created_on > ${before}`);
                    }

                    if (after) {
                        whereClauses.push(sql`college.created_on < ${after}`);
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
                        sql` ORDER BY college.created_on ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.run(statement);
                    return result.rows.map((row) => {
                        const next: SelectCollegeSchema = {
                            id: row.id as number,
                            name: row.name as string,
                            hideFromSelection: Boolean(row.hide_from_selection),
                            communeId: row.commune_id as number,
                            normalizedName: row.normalized_name as string,
                            createdOn: new Date(row.created_on as number),
                            modifiedOn: new Date(row.modified_on as number),
                        };

                        return selectCollegeSchema.parse(next);
                    });
                },
            );
        },
    }),

    collegesByCommune: t.field({
        type: [CollegeRef],
        authz: {
            rules: ['IsAuthenticated'],
        },
        args: {
            communeId: t.arg.int({
                required: true,
            }),
        },
        resolve: async (parent, { communeId }, { DB }) => {
            const results = await DB.query.collegeTable.findMany({
                where: (field, { eq }) => eq(field.communeId, communeId),
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectCollegeSchema.parse(u));
        },
    }),
}));
