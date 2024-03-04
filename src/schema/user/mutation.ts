import { schemaBuilder } from '@/schema/schema-builder';
import { StudentRef, TeacherRef } from './ref';
import {
    InsertStudentSchema,
    insertStudentSchema,
    studentProfileTable,
    InsertTeacherSchema,
    insertTeacherSchema,
    teacherProfileTable,
    InsertCollegeTeacherRelationSchema,
    collegeAndTeacherRelationTable,
    insertCollegeTeacherRelationSchema,
    insertCollegeSchema,
    collegeTable,
} from '@/db/drizzle-schema';
import { randomUUID } from 'crypto';

schemaBuilder.mutationFields((t) => ({
    createStudent: t.field({
        type: StudentRef,
        authz: {
            rules: ['IsAuthenticated'],
        },
        args: {
            communeId: t.arg.int({
                required: true,
            }),
            collegeId: t.arg.int({
                required: false,
            }),
            newCollegeName: t.arg.string({
                required: false,
            }),
        },
        resolve: async (parent, args, { DB, USER }) => {
            const alreadyStudent = await DB.query.studentProfileTable
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

            if (alreadyStudent) {
                throw new Error('User is already a student');
            }

            if (!args.collegeId && !args.newCollegeName) {
                throw new Error('CollegeId or newCollegeName is required');
            }

            if (args.collegeId && args.newCollegeName) {
                throw new Error('Only one of collegeId or newCollegeName is required');
            }

            if (args.newCollegeName) {
                const valuesToParse = {
                    name: args.newCollegeName,
                    communeId: args.communeId,
                };
                const values = insertCollegeSchema.parse(valuesToParse);

                const newCollege = await DB.insert(collegeTable)
                    .values(values)
                    .returning({
                        id: collegeTable.id,
                    })
                    .get();

                args.collegeId = newCollege.id;
            }

            const valuesToParse: InsertStudentSchema = {
                userId: USER.id,
                alreadyCreatedBySignup: true,
                aylinCalled: false,
                completedProfile: false,
                forAylin: false,
                discordLinkWasClicked: false,
                hasClickedWhatsappLink: false,
                hasUnsuscribed: false,
                isStudent: true,
                initiatedSessionWithPhoneToken: false,
                uuid: randomUUID(),
                collegeId: args.collegeId,
                communeId: args.communeId,
            };

            const values = insertStudentSchema.parse(valuesToParse);

            return await DB.insert(studentProfileTable).values(values).returning().get();
        },
    }),
    createTeacher: t.field({
        type: TeacherRef,
        authz: {
            rules: ['IsAuthenticated'],
        },
        args: {
            communeId: t.arg.int({
                required: true,
            }),
            collegeId: t.arg.int({
                required: false,
            }),
            newCollegeName: t.arg.string({
                required: false,
            }),
            role: t.arg.string({
                required: true,
            }),
        },
        resolve: async (parent, args, { DB, USER }) => {
            const alreadyTeacher = await DB.query.teacherProfileTable
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

            if (alreadyTeacher) {
                throw new Error('User is already a teacher');
            }

            if (!args.collegeId && !args.newCollegeName) {
                throw new Error('CollegeId or newCollegeName is required');
            }

            if (args.collegeId && args.newCollegeName) {
                throw new Error('Only one of collegeId or newCollegeName is required');
            }

            if (args.newCollegeName) {
                const valuesToParse = {
                    name: args.newCollegeName,
                    communeId: args.communeId,
                };
                const values = insertCollegeSchema.parse(valuesToParse);

                const newCollege = await DB.insert(collegeTable)
                    .values(values)
                    .returning({
                        id: collegeTable.id,
                    })
                    .get();

                args.collegeId = newCollege.id;
            }

            const valuesToParse: InsertTeacherSchema = {
                userId: USER.id,
            };
            const values = insertTeacherSchema.parse(valuesToParse);

            const newTeacher = await DB.insert(teacherProfileTable)
                .values(values)
                .returning()
                .get();

            const relationValuesToParse: InsertCollegeTeacherRelationSchema = {
                collegeId: args.collegeId as number,
                commitsToParticipate: true,
                rol: args.role,
                teacherId: newTeacher.id,
            };
            const relationValues =
                insertCollegeTeacherRelationSchema.parse(relationValuesToParse);

            await DB.insert(collegeAndTeacherRelationTable).values(relationValues);

            return newTeacher;
        },
    }),
}));
