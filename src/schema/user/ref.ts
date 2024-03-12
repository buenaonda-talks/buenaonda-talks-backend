import {
    ScholarshipConvocatoryKind,
    SelectStudentSchema,
    SelectTeacherSchema,
    SelectUserSchema,
    selectStudentSchema,
    selectTeacherSchema,
    selectUsersSchema,
} from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';
import { TalkInscriptionRef } from '../talk';
import { ApplicationRef } from '../scholarship-application';
import { ScholarshipApplicationRepository } from '@/db/repository/scholarship-application';
import { CollegeRef } from '../college';

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

        teacherProfile: t.field({
            type: TeacherRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const teacher = await DB.query.teacherProfileTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, parent.id);
                    },
                });

                if (!teacher) {
                    return null;
                }

                return selectTeacherSchema.parse(teacher);
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

        lastPlatziTalkInscription: t.field({
            type: TalkInscriptionRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const assistance = await DB.query.talkInscriptionTable.findFirst({
                    where: (fields, ops) => {
                        return ops.eq(fields.userId, parent.userId);
                    },
                });

                if (!assistance) {
                    return null;
                }

                return assistance;
            },
        }),

        lastPlatziApplication: t.field({
            type: ApplicationRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const application =
                    await ScholarshipApplicationRepository.getLastUserApplication(
                        DB,
                        parent,
                        ScholarshipConvocatoryKind.PLATZI,
                    );

                if (!application) {
                    return null;
                }

                return application;
            },
        }),

        lastDevfApplication: t.field({
            type: ApplicationRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const application =
                    await ScholarshipApplicationRepository.getLastUserApplication(
                        DB,
                        parent,
                        ScholarshipConvocatoryKind.DEVF,
                    );

                if (!application) {
                    return null;
                }

                return application;
            },
        }),
    }),
});

export const TeacherRef = schemaBuilder.objectRef<SelectTeacherSchema>('Teacher');
schemaBuilder.objectType(TeacherRef, {
    description: 'Representation of a teacher',
    fields: (t) => ({
        id: t.exposeID('id', { nullable: false }),

        isVerified: t.exposeBoolean('isVerified', { nullable: false }),

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

        colleges: t.field({
            type: [CollegeRef],
            nullable: false,
            resolve: async (parent, _args, { DB }) => {
                const relations = await DB.query.collegeAndTeacherRelationTable.findMany({
                    where: (fields, ops) => {
                        return ops.eq(fields.teacherId, parent.id);
                    },
                    columns: {
                        collegeId: true,
                    },
                });

                if (relations.length === 0) {
                    return [];
                }

                const colleges = await DB.query.collegeTable.findMany({
                    where: (fields, ops) => {
                        return ops.inArray(
                            fields.id,
                            relations.map((r) => r.collegeId),
                        );
                    },
                });

                return colleges;
            },
        }),
    }),
});
