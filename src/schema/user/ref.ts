import {
    SelectStudentSchema,
    SelectUserSchema,
    selectStudentSchema,
    selectUsersSchema,
} from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';

/* 
export const userTable = sqliteTable(
    'users_usermodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),

        sub: text('sub'),
        email: text('email').notNull(),

        dateJoined: int('date_joined', {
            mode: 'timestamp_ms',
        }).notNull(),

        firstName: text('first_name').notNull(),
        normalizedFirstName: text('normalized_first_name').notNull(),

        lastName: text('last_name').notNull(),
        normalizedLastName: text('normalized_last_name').notNull(),

        phoneCode: text('phone_code'),
        phoneNumber: text('phone_number'),
        whatsappStatus: int('whatsapp_status').notNull().default(WhatsappStatus.UNKNOWN),

        birthdate: int('birthdate', {
            mode: 'timestamp',
        }),

        isSuperAdmin: int('isSuperAdmin', { mode: 'boolean' }).default(false),
        isStudent: int('isStudent', { mode: 'boolean' }).default(false),
        isTeacher: int('isTeacher', { mode: 'boolean' }).default(false),
        isAdmin: int('isAdmin', { mode: 'boolean' }).default(false),
        isBoardMember: int('isBoardMember', { mode: 'boolean' }).default(false),
        isInterested: int('isInterested', { mode: 'boolean' }).default(false),

        emailVerified: int('emailVerified', { mode: 'boolean' }).default(false),
        imageUrl: text('imageUrl'),
        username: text('username', { length: 64 }),
        twoFactorEnabled: int('twoFactorEnabled', { mode: 'boolean' }),
        unsafeMetadata: blob('unsafeMetadata'),
        publicMetadata: blob('publicMetadata'),
    },
    (table) => {
        return {
            dateJoinedF5Deb65B: index('users_usermodel_date_joined_f5deb65b').on(
                table.dateJoined,
            ),
            normalizedFirstNameIndex: index('users_normalized_first_name_index').on(
                table.normalizedFirstName,
            ),
            normalizedLastNameIndex: index('users_normalized_last_name_index').on(
                table.normalizedLastName,
            ),
            emailIndex: index('users_email_index').on(table.email),
        };
    },
); */

export const UserRef = schemaBuilder.objectRef<SelectUserSchema>('User');
schemaBuilder.objectType(UserRef, {
    description: 'Representation of a user',
    fields: (t) => ({
        id: t.exposeID('id', { nullable: false }),

        dateJoined: t.field({
            type: 'DateTime',
            resolve: (parent) => parent.dateJoined,
        }),

        firstName: t.exposeString('firstName', { nullable: false }),
        lastName: t.exposeString('lastName', { nullable: false }),

        email: t.exposeString('email', { nullable: false }),

        phoneCode: t.exposeString('phoneCode', { nullable: true }),
        phoneNumber: t.exposeString('phoneNumber', { nullable: true }),

        isStudent: t.field({
            type: 'Boolean',
            resolve: async (parent, _args, { DB }) => {
                return await DB.query.studentProfileTable
                    .findFirst({
                        where: (field, { eq }) => {
                            return eq(field.userId, parent.id);
                        },
                        columns: {
                            id: true,
                        },
                    })
                    .then((student) => {
                        return !!student;
                    });
            },
        }),

        isTeacher: t.field({
            type: 'Boolean',
            resolve: async (parent, _args, { DB }) => {
                return await DB.query.teacherProfileTable
                    .findFirst({
                        where: (field, { eq }) => {
                            return eq(field.userId, parent.id);
                        },
                        columns: {
                            id: true,
                        },
                    })
                    .then((teacher) => {
                        return !!teacher;
                    });
            },
        }),

        isAdmin: t.field({
            type: 'Boolean',
            resolve: async (parent, _args, { DB }) => {
                return await DB.query.adminProfileTable
                    .findFirst({
                        where: (field, { eq }) => {
                            return eq(field.userId, parent.id);
                        },
                        columns: {
                            id: true,
                        },
                    })
                    .then((admin) => {
                        return !!admin;
                    });
            },
        }),

        isSuperAdmin: t.field({
            type: 'Boolean',
            resolve: (parent) => parent.isSuperAdmin || false,
        }),

        studentProfile: t.field({
            type: StudentRef,
            resolve: async (parent, _args, { DB }) => {
                const student = await DB.query.studentProfileTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, parent.id);
                    },
                });

                if (!student) {
                    throw new Error('Student not found');
                }

                return selectStudentSchema.parse(student);
            },
        }),
    }),
});

export const StudentRef = schemaBuilder.objectRef<SelectStudentSchema>('Student');
schemaBuilder.objectType(StudentRef, {
    description: 'Representation of a student',
    fields: (t) => ({
        id: t.exposeID('id', { nullable: false }),

        user: t.field({
            type: UserRef,
            resolve: async (parent, _args, { DB }) => {
                const user = await DB.query.userTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, parent.userId);
                    },
                });

                if (!user) {
                    throw new Error('User not found');
                }

                return selectUsersSchema.parse(user);
            },
        }),

        collegeId: t.exposeID('collegeId', { nullable: true }),
        convocatoryId: t.exposeID('convocatoryId', { nullable: true }),
    }),
});
