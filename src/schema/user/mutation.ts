import { schemaBuilder } from '@/schema/schema-builder';
import { StudentRef, TeacherRef } from './ref';
import { StudentRepository } from '@/db/repository/student';
import { CollegeInputRef } from '../college';
import { CollegeRepository } from '@/db/repository/college';
import { TeacherRepository } from '@/db/repository/teacher';
import {
    collegeAndTeacherRelationTable,
    studentProfileTable,
    teacherProfileTable,
    userTable,
    applicationFieldAnswerTable,
    addStudentFormEntryTable,
} from '@/db/drizzle-schema';
import { eq } from 'drizzle-orm';

export const UpdateTeacherCollegesInputRef = schemaBuilder.inputType(
    'UpdateTeacherCollegesInput',
    {
        fields: (t) => ({
            collegeId: t.int({
                required: true,
            }),
            rol: t.string({
                required: true,
            }),
        }),
    },
);

schemaBuilder.mutationFields((t) => ({
    createMyStudentProfile: t.field({
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
            if (args.collegeId && args.newCollegeName) {
                throw new Error('Provide either collegeId or newCollegeName, not both.');
            }

            const isAlreadyStudent = await StudentRepository.exists({
                DB,
                forUserId: USER.id,
            });
            if (isAlreadyStudent) throw new Error('User is already a student');

            let college: { id: number } | null = null;
            if (args.newCollegeName) {
                college = await CollegeRepository.create({
                    DB,
                    name: args.newCollegeName,
                    communeId: args.communeId,
                });
            } else if (
                args.collegeId &&
                !(await CollegeRepository.exists({ DB, id: args.collegeId }))
            ) {
                throw new Error('College does not exist');
            } else if (args.collegeId) {
                college = { id: args.collegeId };
            }

            const newStudent = await StudentRepository.createStudentProfile({
                DB,
                userId: USER.id,
            });

            if (college) {
                await StudentRepository.updateCollege({
                    collegeId: college?.id,
                    DB,
                    studentId: newStudent.id,
                });
            }

            return newStudent;
        },
    }),
    updateStudentCollege: t.field({
        type: StudentRef,
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            studentId: t.arg.int({
                required: true,
            }),
            collegeId: t.arg.int({
                required: false,
            }),
            collegeInput: t.arg({
                type: CollegeInputRef,
                required: false,
            }),
        },
        resolve: async (parent, args, { DB }) => {
            const exists = await StudentRepository.exists({
                DB,
                forUserId: args.studentId,
            });

            if (!exists) {
                throw new Error('User is not a student');
            }

            let collegeId: number | null = null;

            if (args.collegeId) {
                const exists = await CollegeRepository.exists({
                    DB,
                    id: args.collegeId,
                });

                if (!exists) {
                    throw new Error('College does not exist');
                }

                collegeId = args.collegeId;
            } else if (args.collegeInput) {
                const newCollege = await CollegeRepository.create({
                    DB,
                    name: args.collegeInput.name,
                    communeId: args.collegeInput.communeId,
                });

                collegeId = newCollege.id;
            } else {
                throw new Error('collegeId or collegeInput is required');
            }

            await StudentRepository.updateCollege({
                DB,
                collegeId,
                studentId: args.studentId,
            });

            const student = await DB.query.studentProfileTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, args.studentId);
                },
            });

            if (!student) {
                throw new Error('Student not found');
            }

            return student;
        },
    }),
    createVerifiedTeacherProfile: t.field({
        type: TeacherRef,
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            userId: t.arg.int({
                required: true,
            }),
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
        resolve: async (parent, args, { DB }) => {
            if (!args.collegeId && !args.newCollegeName) {
                throw new Error('CollegeId or newCollegeName is required');
            }

            if (args.collegeId && args.newCollegeName) {
                throw new Error('Only one of collegeId or newCollegeName is required');
            }

            const alreadyTeacher = await TeacherRepository.exists({
                DB,
                forUserId: args.userId,
            });
            if (alreadyTeacher) {
                throw new Error('User is already a teacher');
            }

            let college: { id: number } | null = null;
            if (args.newCollegeName) {
                college = await CollegeRepository.create({
                    DB,
                    name: args.newCollegeName,
                    communeId: args.communeId,
                });
            } else if (
                args.collegeId &&
                !(await CollegeRepository.exists({ DB, id: args.collegeId }))
            ) {
                throw new Error('College does not exist');
            } else if (args.collegeId) {
                college = { id: args.collegeId };
            }

            if (!college) {
                throw new Error('College not found');
            }

            const teacher = await TeacherRepository.createTeacherProfile({
                DB,
                userId: args.userId,
                hasSignedUp: true,
                isVerified: true,
            });

            await TeacherRepository.updateColleges({
                DB,
                teacherId: teacher.id,
                newColleges: [{ id: college.id, rol: args.role }],
                collegeIDsToRemove: [],
            });

            return teacher;
        },
    }),
    createMyTeacherProfile: t.field({
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
            if (!args.collegeId && !args.newCollegeName) {
                throw new Error('CollegeId or newCollegeName is required');
            }

            if (args.collegeId && args.newCollegeName) {
                throw new Error('Only one of collegeId or newCollegeName is required');
            }

            const alreadyTeacher = await TeacherRepository.exists({
                DB,
                forUserId: USER.id,
            });
            if (alreadyTeacher) {
                throw new Error('User is already a teacher');
            }

            let college: { id: number } | null = null;
            if (args.newCollegeName) {
                college = await CollegeRepository.create({
                    DB,
                    name: args.newCollegeName,
                    communeId: args.communeId,
                });
            } else if (
                args.collegeId &&
                !(await CollegeRepository.exists({ DB, id: args.collegeId }))
            ) {
                throw new Error('College does not exist');
            } else if (args.collegeId) {
                college = { id: args.collegeId };
            }

            if (!college) {
                throw new Error('College not found');
            }

            const teacher = await TeacherRepository.createTeacherProfile({
                DB,
                userId: USER.id,
                hasSignedUp: true,
                isVerified: false,
            });

            await TeacherRepository.updateColleges({
                DB,
                teacherId: teacher.id,
                newColleges: [{ id: college.id, rol: args.role }],
                collegeIDsToRemove: [],
            });

            return teacher;
        },
    }),
    updateTeacher: t.field({
        type: TeacherRef,
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            teacherId: t.arg.int({
                required: true,
            }),
            colleges: t.arg({
                type: [UpdateTeacherCollegesInputRef],
                required: true,
            }),
            collegesToRemove: t.arg.intList({ required: true }),
            isVerified: t.arg.boolean({
                required: false,
            }),
        },
        resolve: async (parent, args, { DB }) => {
            const teacher = await TeacherRepository.exists({
                DB,
                teacherId: args.teacherId,
            });

            if (!teacher) {
                throw new Error('Teacher not found');
            }

            if (args.isVerified) {
                await TeacherRepository.update({
                    DB,
                    teacherId: args.teacherId,
                    verified: args.isVerified,
                });
            }

            await TeacherRepository.updateColleges({
                DB,
                teacherId: args.teacherId,
                newColleges: args.colleges.map((college) => ({
                    id: college.collegeId,
                    rol: college.rol,
                })),
                collegeIDsToRemove: args.collegesToRemove,
            });

            const updatedTeacher = await DB.query.teacherProfileTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, args.teacherId);
                },
            });

            if (!updatedTeacher) {
                throw new Error('Teacher not found');
            }

            return updatedTeacher;
        },
    }),
    deleteUser: t.field({
        type: 'Boolean',
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            userId: t.arg.int({
                required: true,
            }),
        },
        resolve: async (parent, args, { DB }) => {
            const user = await DB.query.userTable.findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, args.userId);
                },
            });
            if (!user) {
                throw new Error('User not found');
            }

            const teacherId = await DB.query.teacherProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, args.userId);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((teacher) => {
                    return teacher?.id;
                });
            if (teacherId) {
                await DB.delete(collegeAndTeacherRelationTable).where(
                    eq(collegeAndTeacherRelationTable.teacherId, teacherId),
                );

                await DB.delete(teacherProfileTable).where(
                    eq(teacherProfileTable.userId, args.userId),
                );
            }

            await DB.delete(addStudentFormEntryTable).where(
                eq(addStudentFormEntryTable.userId, args.userId),
            );

            await DB.delete(applicationFieldAnswerTable).where(
                eq(applicationFieldAnswerTable.submissionId, args.userId),
            );

            const studentId = await DB.query.studentProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, args.userId);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((student) => {
                    return student?.id;
                });

            if (studentId) {
                await DB.delete(studentProfileTable).where(
                    eq(studentProfileTable.userId, args.userId),
                );
                await DB.delete(studentProfileTable).where(
                    eq(studentProfileTable.userId, args.userId),
                );
            }

            await DB.delete(userTable).where(eq(userTable.id, args.userId));

            return true;
        },
    }),
    verifyTeacher: t.field({
        type: 'Boolean',
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        args: {
            teacherId: t.arg.int({
                required: true,
            }),
        },
        resolve: async (parent, args, { DB }) => {
            const exists = await TeacherRepository.exists({
                DB,
                teacherId: args.teacherId,
            });
            if (!exists) {
                throw new Error('Teacher not found');
            }

            await TeacherRepository.update({
                DB,
                teacherId: args.teacherId,
                verified: true,
            });

            return true;
        },
    }),
}));
