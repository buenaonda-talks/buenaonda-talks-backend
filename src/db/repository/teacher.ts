import {
    InsertTeacherSchema,
    insertTeacherSchema,
    teacherProfileTable,
    collegeAndTeacherRelationTable,
    InsertCollegeTeacherRelationSchema,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { inArray } from 'drizzle-orm';

type ExistsOptions = {
    DB: YogaContext['DB'];
} & (
    | {
          forUserId: number;
      }
    | {
          teacherId: number;
      }
);

type UpdateCollegesOptions = {
    DB: YogaContext['DB'];
    teacherId: number;
    newColleges: {
        id: number;
        rol: string;
    }[];
    collegeIDsToRemove: number[];
};

type CreateTeacherOptions = {
    DB: YogaContext['DB'];
    userId: number;
    isVerified: boolean;
    hasSignedUp: boolean;
};

export const TeacherRepository = {
    exists: async (props: ExistsOptions) => {
        const { DB } = props;

        if ('forUserId' in props) {
            const teacher = await DB.query.teacherProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, props.forUserId);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((teacher) => {
                    return !!teacher;
                });

            return teacher;
        }

        const teacher = await DB.query.teacherProfileTable
            .findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, props.teacherId);
                },
                columns: {
                    id: true,
                },
            })
            .then((teacher) => {
                return !!teacher;
            });

        return teacher;
    },
    updateColleges: async (props: UpdateCollegesOptions) => {
        const { DB, teacherId, newColleges, collegeIDsToRemove } = props;

        if (collegeIDsToRemove.length > 0) {
            await DB.delete(collegeAndTeacherRelationTable)
                .where(
                    inArray(collegeAndTeacherRelationTable.collegeId, collegeIDsToRemove),
                )
                .then((res) => res[0]);
        }

        for (const someCollege of newColleges) {
            const insertValues: InsertCollegeTeacherRelationSchema = {
                collegeId: someCollege.id,
                teacherId,
                commitsToParticipate: true,
                rol: someCollege.rol,
            };
            await DB.insert(collegeAndTeacherRelationTable).values(insertValues);
        }

        return true;
    },
    update: async (props: {
        DB: YogaContext['DB'];
        teacherId: number;
        verified: boolean;
    }) => {
        const { DB, teacherId } = props;

        return await DB.update(teacherProfileTable)
            .set({
                isVerified: props.verified,
            })
            .where(inArray(teacherProfileTable.id, [teacherId]))
            .returning()
            .then((res) => res[0]);
    },
    createTeacherProfile: async (props: CreateTeacherOptions) => {
        const valuesToParse: InsertTeacherSchema = {
            userId: props.userId,
            isVerified: props.isVerified,
            hasSignedUp: props.hasSignedUp,
        };

        const values = insertTeacherSchema.parse(valuesToParse);

        return await props.DB.insert(teacherProfileTable)
            .values(values)
            .returning()
            .then((res) => res[0]);
    },
};
