import {
    ScholarshipConvocatoryKind,
    convocatoryTable,
    scholarshipTable,
    selectScholarshipSchema,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { and, eq } from 'drizzle-orm';

export const ScholarshipRepository = {
    getScholarship: async (
        DB: YogaContext['DB'],
        USER: NonNullable<YogaContext['USER']>,
        kind: ScholarshipConvocatoryKind,
    ) => {
        const result = await DB.select()
            .from(scholarshipTable)
            .innerJoin(
                convocatoryTable,
                eq(convocatoryTable.id, scholarshipTable.convocatoryId),
            )
            .where(
                and(
                    eq(convocatoryTable.kind, kind),
                    eq(scholarshipTable.userId, USER.id),
                ),
            )
            .limit(1)
            .then((res) => res[0]);

        if (!result) {
            return null;
        }

        return selectScholarshipSchema.parse(result.core_scholarshipmodel);
    },
};
