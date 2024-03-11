import {
    SelectCollegeSchema,
    SelectCollegeTeacherRelationSchema,
} from '@/db/drizzle-schema';
import { schemaBuilder } from '@/schema/schema-builder';

export const CollegeRef = schemaBuilder.objectRef<SelectCollegeSchema>('College');
schemaBuilder.objectType(CollegeRef, {
    description: 'Representation of a college',
    fields: (t) => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        hideFromSelection: t.exposeBoolean('hideFromSelection'),
        communeId: t.exposeID('communeId', {
            description: 'The commune where the college is located',
            nullable: true,
        }),
        normalizedName: t.exposeString('normalizedName'),
    }),
});

export const CollegeTeacherRelationRef =
    schemaBuilder.objectRef<SelectCollegeTeacherRelationSchema>('CollegeTeacherRelation');
schemaBuilder.objectType(CollegeTeacherRelationRef, {
    description: 'Representation of a college-teacher relation',
    fields: (t) => ({
        id: t.exposeID('id'),
        rol: t.exposeString('rol'),
        commitsToParticipate: t.exposeBoolean('commitsToParticipate'),
        collegeId: t.exposeID('collegeId', {
            description: 'The college',
        }),
        teacherid: t.exposeID('teacherId', {
            description: 'The teacher',
        }),
    }),
});
