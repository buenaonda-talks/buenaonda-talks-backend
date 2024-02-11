import {
    FormFieldType,
    InsertApplicationHistorySchema,
    SelectApplicationFieldAnswerSchema,
    SelectFormFieldOptionSchema,
    applicationHistoryTable,
    applicationTable,
} from '@/db/drizzle-schema';
import { ORM_TYPE } from '@/db/get-db';
import { ApplicationStatus } from '@/db/shared';
import { eq } from 'drizzle-orm';

class ApplicationStatusManager {
    private db: ORM_TYPE;

    constructor(db: ORM_TYPE) {
        this.db = db;
    }

    public async updateApplicationStatus(
        applicationId: number,
        values: InsertApplicationHistorySchema,
    ) {
        const { id } = await this.db
            .insert(applicationHistoryTable)
            .values(values)
            .returning({
                id: applicationHistoryTable.id,
            })
            .get();

        return await this.db
            .update(applicationTable)
            .set({
                currentStatusId: id,
            })
            .where(eq(applicationTable.id, applicationId));
    }

    public async evaluateApplicationStatus(
        applicationId: number,
        relevantOptions: Pick<
            SelectFormFieldOptionSchema,
            'automaticResultObservations' | 'id' | 'automaticResult'
        >[],
        relevantFieldsIds: number[],
    ): Promise<InsertApplicationHistorySchema> {
        const relevantAnswers = relevantFieldsIds.length
            ? await this.fetchRelevantAnswers(applicationId, relevantFieldsIds)
            : [];

        return this.generateApplicationHistoryValues(
            applicationId,
            relevantOptions,
            relevantAnswers,
        );
    }

    public async fetchRelevantFormFields(formId: number) {
        // Fetch only important RADIO_BOX fields to reduce unnecessary data retrieval
        const importantFields = await this.db.query.formFieldTable.findMany({
            where: (etc, { eq, and }) =>
                and(
                    eq(etc.formId, formId),
                    eq(etc.isImportant, true),
                    eq(etc.type, FormFieldType.RADIO_BOX),
                ),
            columns: { id: true },
        });

        // Optimize query by pre-filtering fields based on their importance and type
        const relevantOptions =
            importantFields.length > 0
                ? await this.fetchOptionsForImportantFields(importantFields)
                : [];

        // Extract unique field IDs from relevant options to avoid duplicates
        const relevantFieldsIds = [
            ...new Set(relevantOptions.map((option) => option.fieldId)),
        ];

        return { relevantOptions, relevantFieldsIds };
    }

    private async fetchOptionsForImportantFields(
        importantFields: { id: number }[],
    ): Promise<
        Pick<
            SelectFormFieldOptionSchema,
            'id' | 'automaticResult' | 'automaticResultObservations' | 'fieldId'
        >[]
    > {
        return await this.db.query.formFieldOptionTable.findMany({
            where: (etc, ops) =>
                ops.and(
                    ops.inArray(
                        etc.fieldId,
                        importantFields.map((f) => f.id),
                    ),
                    ops.inArray(etc.automaticResult, [
                        ApplicationStatus.DECLINED,
                        ApplicationStatus.PENDING,
                    ]),
                ),
            columns: {
                id: true,
                automaticResult: true,
                automaticResultObservations: true,
                fieldId: true,
            },
        });
    }

    private async fetchRelevantAnswers(
        applicationId: number,
        relevantFieldsIds: number[],
    ): Promise<Pick<SelectApplicationFieldAnswerSchema, 'fieldId' | 'value'>[]> {
        return await this.db.query.applicationFieldAnswerTable.findMany({
            where: (etc, { and, inArray }) =>
                and(
                    eq(etc.submissionId, applicationId),
                    inArray(etc.fieldId, relevantFieldsIds),
                ),
            columns: { fieldId: true, value: true },
        });
    }

    private generateApplicationHistoryValues(
        applicationId: number,
        relevantOptions: Pick<
            SelectFormFieldOptionSchema,
            'automaticResultObservations' | 'id' | 'automaticResult'
        >[],
        relevantAnswers: Pick<SelectApplicationFieldAnswerSchema, 'fieldId' | 'value'>[],
    ): InsertApplicationHistorySchema {
        const historyValues: InsertApplicationHistorySchema = {
            submissionId: applicationId,
            status: ApplicationStatus.ACCEPTED,
            observations: null,
        };

        const observations = relevantAnswers.flatMap((answer) => {
            const option = relevantOptions.find((o) => o.id.toString() === answer.value);
            if (!option) return [];

            // Update status based on the option's automatic result
            if (option.automaticResult === ApplicationStatus.DECLINED) {
                historyValues.status = ApplicationStatus.DECLINED;
            } else if (
                option.automaticResult === ApplicationStatus.PENDING &&
                historyValues.status !== ApplicationStatus.DECLINED
            ) {
                historyValues.status = ApplicationStatus.PENDING;
            }

            return option.automaticResultObservations
                ? [option.automaticResultObservations]
                : [];
        });

        if (observations.length) {
            historyValues.observations = observations.join(', ');
        }

        return historyValues;
    }
}

export default ApplicationStatusManager;
