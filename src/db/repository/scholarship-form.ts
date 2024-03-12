import {
    ScholarshipConvocatoryKind,
    convocatoryTable,
    formTable,
    selectFormSchema,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { and, eq, gte, lte, notInArray } from 'drizzle-orm';

export const FormRepository = {
    getOpenForm: async (
        DB: YogaContext['DB'],
        kind: ScholarshipConvocatoryKind,
        exclude: number[],
    ) => {
        const now = new Date();

        const result = await DB.select()
            .from(formTable)
            .innerJoin(convocatoryTable, eq(convocatoryTable.id, formTable.convocatoryId))
            .where(
                and(
                    eq(convocatoryTable.kind, kind),
                    lte(formTable.openDate, now),
                    gte(formTable.closeDate, now),
                    ...(exclude && exclude.length > 0
                        ? [notInArray(formTable.id, exclude)]
                        : []),
                ),
            )
            .limit(1)
            .then((res) => res[0]);

        if (!result) {
            return null;
        }

        return selectFormSchema.parse(result.core_formmodel);
    },
};
