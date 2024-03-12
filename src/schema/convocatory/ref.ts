import { schemaBuilder } from '@/schema/schema-builder';

import {
    SelectConvocatorySchema,
    ScholarshipConvocatoryKind,
} from '@/db/model/convocatory';
import { FormRef } from '../scholarship-form';
import { TalkRef } from '../talk';
import { selectTalkSchema } from '@/db/drizzle-schema';

export const ScholarshipConvocatoryKindRef = schemaBuilder.enumType(
    ScholarshipConvocatoryKind,
    {
        name: 'ScholarshipConvocatoryKind',
    },
);

export const ConvocatoryRef =
    schemaBuilder.objectRef<SelectConvocatorySchema>('Convocatory');
schemaBuilder.objectType(ConvocatoryRef, {
    description: 'Representation of a convocatory',
    fields: (t) => ({
        id: t.exposeID('id'),

        privateLabel: t.exposeString('privateLabel'),

        kind: t.field({
            type: ScholarshipConvocatoryKindRef,
            resolve: (parent) => parent.kind,
        }),

        order: t.exposeInt('order'),

        countAddingsFromDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (parent) => {
                const countAddingsFromDate = parent.countAddingsFromDate;
                if (!countAddingsFromDate) {
                    return null;
                }

                return new Date(countAddingsFromDate);
            },
        }),
        countAddingsTillDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (parent) => {
                if (!parent.countAddingsTillDate) {
                    return null;
                }

                return new Date(parent.countAddingsTillDate);
            },
        }),

        lessonsStartDate: t.exposeString('lessonsStartDate', {
            nullable: true,
        }),
        lessonsEndDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (parent) => {
                if (!parent.lessonsEndDate) {
                    return null;
                }

                return new Date(parent.lessonsEndDate);
            },
        }),

        maximumWithdrawalDate: t.field({
            type: 'Date',
            nullable: true,
            resolve: (parent) => {
                if (!parent.maximumWithdrawalDate) {
                    return null;
                }

                return new Date(parent.maximumWithdrawalDate);
            },
        }),

        isWithdrawable: t.exposeBoolean('isWithdrawable'),

        devfInformedGraduates: t.exposeInt('devfInformedGraduates', {
            nullable: true,
        }),
        devfInformedPaused: t.exposeInt('devfInformedPaused', {
            nullable: true,
        }),
        devfInformedResigned: t.exposeInt('devfInformedResigned', {
            nullable: true,
        }),
        devfInformedStudying: t.exposeInt('devfInformedStudying', {
            nullable: true,
        }),
        devfInformedNotAssisted: t.exposeInt('devfInformedNotAssisted', {
            nullable: true,
        }),

        form: t.field({
            type: FormRef,
            nullable: true,
            resolve: (parent, _args, { DB }) => {
                const form = DB.query.formTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.convocatoryId, parent.id);
                    },
                });

                if (!form) {
                    return null;
                }

                return form;
            },
        }),

        talk: t.field({
            type: TalkRef,
            nullable: true,
            resolve: async (parent, _args, { DB }) => {
                const talk = await DB.query.talkTable.findFirst({
                    where: (field, { eq }) => {
                        return eq(field.convocatoryId, parent.id);
                    },
                });

                if (!talk) {
                    return null;
                }

                return selectTalkSchema.parse(talk);
            },
        }),
    }),
});
