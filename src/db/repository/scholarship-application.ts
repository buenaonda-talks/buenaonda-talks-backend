import {
    ScholarshipConvocatoryKind,
    applicationTable,
    convocatoryTable,
    formTable,
    selectApplicationSchema,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { and, desc, eq } from 'drizzle-orm';

export const ScholarshipApplicationRepository = {
    getLastUserApplication: async (
        DB: YogaContext['DB'],
        USER: NonNullable<YogaContext['USER']>,
        kind: ScholarshipConvocatoryKind,
    ) => {
        const result = await DB.select()
            .from(applicationTable)
            .innerJoin(formTable, eq(formTable.id, applicationTable.formId))
            .innerJoin(convocatoryTable, eq(convocatoryTable.id, formTable.convocatoryId))
            .where(
                and(
                    eq(convocatoryTable.kind, kind),
                    eq(applicationTable.userId, USER.id),
                ),
            )
            .orderBy(desc(applicationTable.createdOn))
            .limit(1)
            .get();

        if (!result) {
            return null;
        }

        return selectApplicationSchema.parse(result.core_postulationsubmissionmodel);
    },
};
