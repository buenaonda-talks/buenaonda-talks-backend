import {
    SelectStudentSchema,
    SelectUserSchema,
    selectStudentSchema,
    selectUsersSchema,
} from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';

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
