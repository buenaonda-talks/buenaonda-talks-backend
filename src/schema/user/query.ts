/* eslint-disable @typescript-eslint/no-explicit-any */
import { schemaBuilder } from '@/schema/schema-builder';
import { UserRef } from './ref';
import {
    ResolveCursorConnectionArgs,
    resolveCursorConnection,
} from '@pothos/plugin-relay';
import { sql } from 'drizzle-orm';
import {
    SelectUserSchema,
    collegeAndTeacherRelationTable,
    selectUsersSchema,
    studentProfileTable,
    teacherProfileTable,
    userTable,
} from '@/db/drizzle-schema';
import { normalize } from '@/utils';
import { TeacherRepository } from '@/db/repository/teacher';

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

const TeachersFilterRef = schemaBuilder.inputType('TeachersFilter', {
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
                    toCursor: (user) => user.dateJoined.toString(),
                },
                async ({
                    before,
                    after,
                    limit,
                    inverted,
                }: ResolveCursorConnectionArgs) => {
                    const { query } = args.filter;

                    const whereClauses = [];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const joins: any[] = [];

                    // Base query
                    let statement = sql`SELECT qs_user.* FROM ${userTable} AS qs_user`;

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        whereClauses.push(sql`
                            (qs_user.normalized_first_name ILIKE ${fuzzyQuery}
                            OR qs_user.normalized_last_name ILIKE ${fuzzyQuery}
                            OR (qs_user.normalized_first_name || ' ' || qs_user.normalized_last_name) ILIKE ${fuzzyQuery}
                            OR qs_user.email ILIKE ${fuzzyQuery}
                            OR qs_user.phone_code ILIKE ${fuzzyQuery}
                            OR qs_user.phone_number ILIKE ${fuzzyQuery}
                            OR (qs_user.phone_code || qs_user.phone_number) ILIKE ${fuzzyQuery})
                        `);
                    }

                    if (before) {
                        whereClauses.push(
                            sql`qs_user.date_joined > ${new Date(before).toISOString()}`,
                        );
                    }

                    if (after) {
                        whereClauses.push(
                            sql`qs_user.date_joined < ${new Date(after).toISOString()}`,
                        );
                    }

                    // Combine all parts into the final
                    statement = sql`${statement} ${sql.join(joins, sql` `)}`;
                    if (whereClauses.length > 0) {
                        statement = sql`${statement} WHERE ${sql.join(whereClauses, sql` AND `)}`;
                    }

                    // Append ordering and limit as necessary
                    statement = statement.append(
                        sql` ORDER BY qs_user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.execute(statement);

                    return result.map((row: any) => {
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
                    toCursor: (user) => user.dateJoined.toString(),
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
                    let statement = sql`SELECT 
                    qs_user.*
                    FROM ${userTable} AS qs_user`;

                    joins.push(
                        sql`INNER JOIN ${studentProfileTable} AS student ON qs_user.id = student.user_id`,
                    );

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        whereClauses.push(sql`
                            (qs_user.normalized_first_name ILIKE ${fuzzyQuery}
                            OR qs_user.normalized_last_name ILIKE ${fuzzyQuery}
                            OR (qs_user.normalized_first_name || ' ' || qs_user.normalized_last_name) ILIKE ${fuzzyQuery}
                            OR qs_user.email ILIKE ${fuzzyQuery}
                            OR qs_user.phone_code ILIKE ${fuzzyQuery}
                            OR qs_user.phone_number ILIKE ${fuzzyQuery}
                            OR (qs_user.phone_code || qs_user.phone_number) ILIKE ${fuzzyQuery})
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
                        whereClauses.push(
                            sql`qs_user.date_joined > ${new Date(before).toISOString()}`,
                        );
                    }

                    if (after) {
                        whereClauses.push(
                            sql`qs_user.date_joined < ${new Date(after).toISOString()}`,
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
                        sql` ORDER BY qs_user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.execute(statement);
                    return result.map((row: any) => {
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
            rules: ['IsAuthenticated', 'IsTeacher', 'IsVerifiedTeacher'],
        },
        resolve: (_, args, { DB, USER }) => {
            return resolveCursorConnection(
                {
                    args,
                    toCursor: (user) => user.dateJoined.toString(),
                },
                async ({ limit, inverted }: ResolveCursorConnectionArgs) => {
                    const whereClauses = [];
                    const joins = [];

                    // Base query
                    let statement = sql`SELECT qs_user.* FROM ${userTable} AS qs_user`;

                    joins.push(
                        sql`INNER JOIN ${studentProfileTable} AS student ON qs_user.id = student.user_id`,
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
                        sql` ORDER BY qs_user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.execute(statement);
                    const users = result.map((row: any) => {
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
                    }) as SelectUserSchema[];

                    return users;
                },
            );
        },
    }),
    teachers: t.connection({
        type: UserRef,
        args: {
            filter: t.arg({
                type: TeachersFilterRef,
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
                    toCursor: (user) => user.dateJoined.toString(),
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
                    let statement = sql`SELECT qs_user.* FROM ${userTable} AS qs_user`;

                    joins.push(
                        sql`INNER JOIN ${teacherProfileTable} AS teacher ON qs_user.id = teacher.user_id`,
                    );

                    // Dynamic joins and conditions
                    if (query) {
                        const fuzzyQuery = `%${normalize(query)}%`;
                        whereClauses.push(sql`
                            (qs_user.normalized_first_name ILIKE ${fuzzyQuery}
                            OR qs_user.normalized_last_name ILIKE ${fuzzyQuery}
                            OR (qs_user.normalized_first_name || ' ' || qs_user.normalized_last_name) ILIKE ${fuzzyQuery}
                            OR qs_user.email ILIKE ${fuzzyQuery}
                            OR qs_user.phone_code ILIKE ${fuzzyQuery}
                            OR qs_user.phone_number ILIKE ${fuzzyQuery}
                            OR (qs_user.phone_code || qs_user.phone_number) ILIKE ${fuzzyQuery})
                        `);
                    }

                    if (before) {
                        whereClauses.push(
                            sql`qs_user.date_joined > ${new Date(before).toISOString()}`,
                        );
                    }

                    if (after) {
                        whereClauses.push(
                            sql`qs_user.date_joined < ${new Date(after).toISOString()}`,
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
                        sql` ORDER BY qs_user.date_joined ${inverted ? sql`ASC` : sql`DESC`}`,
                    );

                    statement = statement.append(sql` LIMIT ${limit}`);

                    const result = await DB.execute(statement);
                    return result.map((row: any) => {
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
    teacherUserById: t.field({
        type: UserRef,
        args: {
            id: t.arg({
                type: 'Int',
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (_, { id }, { DB }) => {
            const exists = await TeacherRepository.exists({
                DB,
                forUserId: id,
            });
            if (!exists) {
                throw new Error('Teacher not found');
            }

            const user = await DB.query.userTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, id);
                    },
                })
                .then((user) => {
                    return user;
                });

            if (!user) {
                throw new Error('User not found');
            }

            return selectUsersSchema.parse(user);
        },
    }),
}));
