import {
    InsertStudentSchema,
    insertStudentSchema,
    studentProfileTable,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

type ExistsOptions = {
    DB: YogaContext['DB'];
} & (
    | {
          forUserId: number;
      }
    | {
          studentId: number;
      }
);

type UpdateCollegeOptions = {
    DB: YogaContext['DB'];
    studentId: number;
    collegeId: number;
};

type CreateStudentOptions = {
    DB: YogaContext['DB'];
    userId: number;
};

export const StudentRepository = {
    exists: async (props: ExistsOptions) => {
        const { DB } = props;

        if ('forUserId' in props) {
            const student = await DB.query.studentProfileTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.userId, props.forUserId);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((student) => {
                    return !!student;
                });

            return student;
        }

        const student = await DB.query.studentProfileTable
            .findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, props.studentId);
                },
                columns: {
                    id: true,
                },
            })
            .then((student) => {
                return !!student;
            });

        return student;
    },
    updateCollege: async (props: UpdateCollegeOptions) => {
        const { DB, collegeId, studentId } = props;

        await DB.update(studentProfileTable)
            .set({
                collegeId,
            })
            .where(eq(studentProfileTable.id, studentId));
    },
    createStudentProfile: async (props: CreateStudentOptions) => {
        const valuesToParse: InsertStudentSchema = {
            userId: props.userId,
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
        };

        const values = insertStudentSchema.parse(valuesToParse);

        return await props.DB.insert(studentProfileTable)
            .values(values)
            .returning()
            .then((res) => res[0]);
    },
};
