import {
    InsertCollegeSchema,
    collegeAndTeacherRelationTable,
    collegeTable,
    insertCollegeSchema,
    studentProfileTable,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { normalize } from '@/utils';
import { eq } from 'drizzle-orm';

type ExistsProps = {
    DB: YogaContext['DB'];
    id: number;
};

type CreateCollegeProps = {
    DB: YogaContext['DB'];
    name: string;
    communeId: number;
};

type MergeCollegesProps = {
    DB: YogaContext['DB'];
    sourceCollegeId: number;
    targetCollegeId: number;
};

export const CollegeRepository = {
    exists: async ({ DB, id }: ExistsProps) => {
        const college = await DB.query.collegeTable
            .findFirst({
                where: (field, { eq }) => {
                    return eq(field.id, id);
                },
                columns: {
                    id: true,
                },
            })
            .then((college) => {
                return !!college;
            });

        return college;
    },
    create: async ({ DB, communeId, name }: CreateCollegeProps) => {
        const valuesToParse: InsertCollegeSchema = {
            name,
            communeId,
            hideFromSelection: false,
            normalizedName: normalize(name),
        };
        const values = insertCollegeSchema.parse(valuesToParse);

        const newCollege = await DB.insert(collegeTable)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return newCollege;
    },
    merge: async ({ DB, sourceCollegeId, targetCollegeId }: MergeCollegesProps) => {
        await DB.update(studentProfileTable)
            .set({
                collegeId: targetCollegeId,
            })
            .where(eq(studentProfileTable.collegeId, sourceCollegeId));

        await DB.update(collegeAndTeacherRelationTable)
            .set({
                collegeId: targetCollegeId,
            })
            .where(eq(collegeAndTeacherRelationTable.collegeId, sourceCollegeId));

        return await DB.delete(collegeTable)
            .where(eq(collegeTable.id, sourceCollegeId))
            .then((res) => res[0]);
    },
};
