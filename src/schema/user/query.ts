import { schemaBuilder } from '@/schema/schema-builder';
import { UserRef } from './ref';
import {
    ResolveCursorConnectionArgs,
    resolveCursorConnection,
} from '@pothos/plugin-relay';
import { sql } from 'drizzle-orm';
import {
    collegeAndTeacherRelationTable,
    selectUsersSchema,
    studentProfileTable,
    teacherProfileTable,
    userTable,
} from '@/db/drizzle-schema';
import { normalize } from '@/utils';

const StudentsFilterRef = schemaBuilder.inputType('StudentsFilter', {
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
    }),
});

const UsersFilterRef = schemaBuilder.inputType('UsersFilter', {
    fields: (t) => ({
        query: t.string({
            required: false,
        }),
    }),
});

schemaBuilder.queryFields((t) => ({
    user: t.field({
        type: UserRef,
        nullable: true,
        resolve: async (parent, args, { DB, USER }) => {
            // eslint-disable-next-line no-console
            console.log('USER', USER);
            if (!USER) {
                return null;
            }

            const isStudent = await DB.query.studentProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, USER.id);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((student) => {
                    return !!student;
                });

            const isTeacher = await DB.query.teacherProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, USER.id);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((teacher) => {
                    return !!teacher;
                });

            const isAdmin = await DB.query.adminProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, USER.id);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((admin) => {
                    return !!admin;
                });

            const userToReturn = {
                ...USER,
                isStudent: isStudent,
                isTeacher: isTeacher,
                isAdmin: isAdmin,
                isSuperAdmin: USER.isSuperAdmin || false,
            };

            return userToReturn;
        },
    }),

    users: t.connection({
        type: UserRef,
        args: {
            filter: t.arg({
                type: UsersFilterRef,
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
                    toCursor: (user) => Math.floor(user.dateJoined.getTime()).toString(),
                },
                async ({
                    before,
                    after,
                    limit,
                    inverted,
                }: ResolveCursorConnectionArgs) => {
                    const { query } = args.filter;

                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT user.* FROM ${userTable} AS user`;

                    joins.push(
                        sql`INNER JOIN ${studentProfileTable} AS student ON user.id = student.user_id`,
                    );

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
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

                    if (before) {
                        whereClauses.push(sql`user.date_joined > ${before}`);
                    }

                    if (after) {
                        whereClauses.push(sql`user.date_joined < ${after}`);
                    }

                    // Combine all parts into the final
                    statement = sql`${statement} ${sql.join(joins, sql` `)}`;
                    if (whereClauses.length > 0) {
                        statement = sql`${statement} WHERE ${sql.join(whereClauses, sql` AND `)}`;
                    }

                    // Append ordering and limit as necessary
                    statement = statement.append(
                        sql` ORDER BY user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.run(statement);

                    return result.rows.map((row) => {
                        return selectUsersSchema.parse({
                            id: row.id,
                            sub: row.sub,
                            email: row.email,
                            dateJoined: new Date(row.date_joined as string),
                            firstName: row.first_name,
                            normalizedFirstName: row.normalized_first_name,
                            lastName: row.last_name,
                            normalizedLastName: row.normalized_last_name,
                            phoneCode: row.phone_code,
                            phoneNumber: row.phone_number,
                            whatsappStatus: row.whatsapp_status,
                            birthdate: new Date(row.birthdate as string),
                            isSuperAdmin: Boolean(row.isSuperAdmin),
                            isStudent: Boolean(row.isStudent),
                            isTeacher: Boolean(row.isTeacher),
                            isAdmin: Boolean(row.isAdmin),
                            isBoardMember: Boolean(row.isBoardMember),
                            isInterested: Boolean(row.isInterested),
                            emailVerified: Boolean(row.emailVerified),
                            imageUrl: row.imageUrl,
                            username: row.username,
                            twoFactorEnabled: Boolean(row.twoFactorEnabled),
                            unsafeMetadata: row.unsafeMetadata,
                            publicMetadata: row.publicMetadata,
                        });
                    });
                },
            );
        },
    }),

    students: t.connection({
        type: UserRef,
        args: {
            filter: t.arg({
                type: StudentsFilterRef,
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
                    toCursor: (user) => Math.floor(user.dateJoined.getTime()).toString(),
                },
                async ({
                    before,
                    after,
                    limit,
                    inverted,
                }: ResolveCursorConnectionArgs) => {
                    const { query, collegeIDs, convocatoryIDs } = args.filter;

                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT user.* FROM ${userTable} AS user`;

                    joins.push(
                        sql`INNER JOIN ${studentProfileTable} AS student ON user.id = student.user_id`,
                    );

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
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

                    if (collegeIDs && collegeIDs.length > 0) {
                        whereClauses.push(
                            sql`student.college_id IN (${sql.join(
                                collegeIDs.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (convocatoryIDs && convocatoryIDs.length > 0) {
                        whereClauses.push(
                            sql`student.convocatory_id IN (${sql.join(
                                convocatoryIDs.map((id) => sql`${id}`),
                                sql`, `,
                            )})`,
                        );
                    }

                    if (before) {
                        whereClauses.push(sql`user.date_joined > ${before}`);
                    }

                    if (after) {
                        whereClauses.push(sql`user.date_joined < ${after}`);
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
                        sql` ORDER BY user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.run(statement);
                    return result.rows.map((row) => {
                        return selectUsersSchema.parse({
                            id: row.id,
                            sub: row.sub,
                            email: row.email,
                            dateJoined: new Date(row.date_joined as string),
                            firstName: row.first_name,
                            normalizedFirstName: row.normalized_first_name,
                            lastName: row.last_name,
                            normalizedLastName: row.normalized_last_name,
                            phoneCode: row.phone_code,
                            phoneNumber: row.phone_number,
                            whatsappStatus: row.whatsapp_status,
                            birthdate: new Date(row.birthdate as string),
                            isSuperAdmin: Boolean(row.isSuperAdmin),
                            isStudent: Boolean(row.isStudent),
                            isTeacher: Boolean(row.isTeacher),
                            isAdmin: Boolean(row.isAdmin),
                            isBoardMember: Boolean(row.isBoardMember),
                            isInterested: Boolean(row.isInterested),
                            emailVerified: Boolean(row.emailVerified),
                            imageUrl: row.imageUrl,
                            username: row.username,
                            twoFactorEnabled: Boolean(row.twoFactorEnabled),
                            unsafeMetadata: row.unsafeMetadata,
                            publicMetadata: row.publicMetadata,
                        });
                    });
                },
            );
        },
    }),

    myStudents: t.connection({
        type: UserRef,
        authz: {
            rules: ['IsAuthenticated', 'IsTeacher'],
        },
        resolve: (_, args, { DB, USER }) => {
            return resolveCursorConnection(
                {
                    args,
                    toCursor: (user) => Math.floor(user.dateJoined.getTime()).toString(),
                },
                async ({ limit, inverted }: ResolveCursorConnectionArgs) => {
                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT user.* FROM ${userTable} AS user`;

                    joins.push(
                        sql`INNER JOIN ${studentProfileTable} AS student ON user.id = student.user_id`,
                    );

                    // Dynamic joins and conditions
                    whereClauses.push(
                        sql`student.college_id IN (
                            SELECT collegeAndTeacherRelationTable.college_id 
                            FROM ${collegeAndTeacherRelationTable} AS collegeAndTeacherRelationTable 
                            INNER JOIN ${teacherProfileTable} AS teacher ON collegeAndTeacherRelationTable.teacher_id = teacher.id
                            WHERE teacher.user_id = ${USER.id}
                        )`,
                    );

                    // Combine all parts into the final statement
                    if (joins.length > 0) {
                        statement = sql`${statement} ${sql.join(joins, sql` `)}`;
                    }

                    if (whereClauses.length > 0) {
                        statement = sql`${statement} WHERE ${sql.join(whereClauses, sql` AND `)}`;
                    }

                    // Append ordering and limit as necessary
                    statement = statement.append(
                        sql` ORDER BY user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.run(statement);
                    return result.rows.map((row) => {
                        return selectUsersSchema.parse({
                            id: row.id,
                            sub: row.sub,
                            email: row.email,
                            dateJoined: new Date(row.date_joined as string),
                            firstName: row.first_name,
                            normalizedFirstName: row.normalized_first_name,
                            lastName: row.last_name,
                            normalizedLastName: row.normalized_last_name,
                            phoneCode: row.phone_code,
                            phoneNumber: row.phone_number,
                            whatsappStatus: row.whatsapp_status,
                            birthdate: new Date(row.birthdate as string),
                            isSuperAdmin: Boolean(row.isSuperAdmin),
                            isStudent: Boolean(row.isStudent),
                            isTeacher: Boolean(row.isTeacher),
                            isAdmin: Boolean(row.isAdmin),
                            isBoardMember: Boolean(row.isBoardMember),
                            isInterested: Boolean(row.isInterested),
                            emailVerified: Boolean(row.emailVerified),
                            imageUrl: row.imageUrl,
                            username: row.username,
                            twoFactorEnabled: Boolean(row.twoFactorEnabled),
                            unsafeMetadata: row.unsafeMetadata,
                            publicMetadata: row.publicMetadata,
                        });
                    });
                },
            );
        },
    }),
}));
