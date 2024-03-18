import {
    index,
    integer,
    pgTable,
    serial,
    boolean,
    timestamp,
    json,
    text,
} from 'drizzle-orm/pg-core';
import { TIMESTAMP_FIELDS } from '@/db/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { collegeTable } from './college';
import { organizationTable } from './organization';
import { convocatoryTable } from './convocatory';
import { communeTable } from './commune';

export enum Gender {
    MALE = 1,
    FEMALE = 2,
    RATHER_NOT_SAY = 3,
    OTHER = 4,
}

export enum WhatsappStatus {
    UNKNOWN = 1,
    VALID = 2,
    INVALID = 3,
    BLOCKED = 4,
}

export const userTable = pgTable(
    'users_usermodel',
    {
        id: serial('id').primaryKey(),

        sub: text('sub'),
        email: text('email').notNull(),

        dateJoined: timestamp('date_joined').notNull(),

        firstName: text('first_name').notNull(),
        normalizedFirstName: text('normalized_first_name').notNull(),

        lastName: text('last_name').notNull(),
        normalizedLastName: text('normalized_last_name').notNull(),

        phoneCode: text('phone_code'),
        phoneNumber: text('phone_number'),
        whatsappStatus: integer('whatsapp_status')
            .notNull()
            .default(WhatsappStatus.UNKNOWN),

        birthdate: timestamp('birthdate'),

        isSuperAdmin: boolean('isSuperAdmin').default(false),
        isStudent: boolean('isStudent').default(false),
        isTeacher: boolean('isTeacher').default(false),
        isAdmin: boolean('isAdmin').default(false),
        isBoardMember: boolean('isBoardMember').default(false),
        isInterested: boolean('isInterested').default(false),

        emailVerified: boolean('emailVerified').default(false),
        imageUrl: text('imageUrl'),
        username: text('username'),
        twoFactorEnabled: boolean('twoFactorEnabled'),
        unsafeMetadata: json('unsafeMetadata'),
        publicMetadata: json('publicMetadata'),
    },
    (table) => {
        return {
            dateJoinedF5Deb65B: index('users_usermodel_date_joined_f5deb65b').on(
                table.dateJoined,
            ),
            normalizedFirstNameIndex: index('users_normalized_first_name_index').on(
                table.normalizedFirstName,
            ),
            normalizedLastNameIndex: index('users_normalized_last_name_index').on(
                table.normalizedLastName,
            ),
            emailIndex: index('users_email_index').on(table.email),
        };
    },
);

export const boardMemberTable = pgTable('generations_boardmembermodel', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => userTable.id, {
            onDelete: 'cascade',
        }),
    ...TIMESTAMP_FIELDS,
});

export const studentProfileTable = pgTable(
    'generations_studentmodel',
    {
        id: serial('id').primaryKey(),
        allowsWhatsapp: boolean('allows_whatsapp'),
        discordLinkWasClicked: boolean('discord_link_was_clicked').notNull(),
        discordLinkClickDate: timestamp('discord_link_click_date'),
        nationality: text('nationality'),
        observations: text('observations'),
        userId: integer('user_id')
            .notNull()
            .references(() => userTable.id, {
                onDelete: 'cascade',
            }),
        specialization: text('specialization'),
        completedProfile: boolean('completed_profile').notNull(),
        alreadyCreatedBySignup: boolean('already_created_by_signup').notNull(),
        signupDatetime: timestamp('signup_datetime'),
        collegeId: integer('college_id').references(() => collegeTable.id, {
            onDelete: 'cascade',
        }),
        organizationId: integer('organization_id').references(
            () => organizationTable.id,
            {
                onDelete: 'cascade',
            },
        ),
        expectsToDoNextYear: integer('expects_to_do_next_year'),
        gender: integer('gender'),
        grade: integer('grade'),
        timeItTakesToSchool: integer('time_it_takes_to_school'),
        willTakePaesTest: integer('will_take_paes_test'),
        isStudent: boolean('is_student').notNull(),
        uuid: text('uuid').notNull(),
        hasUnsuscribed: boolean('has_unsuscribed').notNull(),
        unsubscriptionDate: timestamp('unsubscription_date'),
        unsubscriptionReason: integer('unsubscription_reason'),
        unsubscriptionText: text('unsubscription_text'),
        convocatoryId: integer('convocatory_id').references(() => convocatoryTable.id, {
            onDelete: 'cascade',
        }),
        communeId: integer('commune_id').references(() => communeTable.id, {
            onDelete: 'cascade',
        }),
        forAylin: boolean('for_aylin').notNull(),
        aylinCalled: boolean('aylin_called').notNull(),
        aylinCalledDate: timestamp('aylin_called_date'),
        hasClickedWhatsappLink: boolean('has_clicked_whatsapp_link').notNull(),
        whatsappLinkClickDate: timestamp('whatsapp_link_click_date'),
        note: text('note'),
        initiatedSessionWithPhoneToken: boolean(
            'initiated_session_with_phone_token',
        ).notNull(),
        ...TIMESTAMP_FIELDS,
    },
    (table) => {
        return {
            forAylin28F8020A: index('generations_studentmodel_for_aylin_28f8020a').on(
                table.forAylin,
            ),
            communeId44B86F28: index('generations_studentmodel_commune_id_44b86f28').on(
                table.communeId,
            ),
            convocatoryIdD53Fede2: index(
                'generations_studentmodel_convocatory_id_d53fede2',
            ).on(table.convocatoryId),
            organizationId3B14B638: index(
                'generations_studentmodel_organization_id_3b14b638',
            ).on(table.organizationId),
            collegeIdC6A46E3C: index('generations_studentmodel_college_id_c6a46e3c').on(
                table.collegeId,
            ),
        };
    },
);

export const selectUsersSchema = createSelectSchema(userTable);
export type SelectUserSchema = z.infer<typeof selectUsersSchema>;

export const insertUserSchema = createInsertSchema(userTable);
export type InsertUserSchema = z.infer<typeof insertUserSchema>;

export const selectStudentSchema = createSelectSchema(studentProfileTable);
export type SelectStudentSchema = z.infer<typeof selectStudentSchema>;

export const insertStudentSchema = createInsertSchema(studentProfileTable);
export type InsertStudentSchema = z.infer<typeof insertStudentSchema>;

export const interestedProfileTable = pgTable('generations_interestedmodel', {
    id: serial('id').primaryKey(),
    rol: text('rol').notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => userTable.id, {
            onDelete: 'cascade',
        }),
    ...TIMESTAMP_FIELDS,
});

export const adminProfileTable = pgTable('generations_administratormodel', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => userTable.id, {
            onDelete: 'cascade',
        }),
    ...TIMESTAMP_FIELDS,
});

export const teacherProfileTable = pgTable('generations_teachermodel', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => userTable.id, {
            onDelete: 'cascade',
        }),
    isVerified: boolean('is_verified').notNull(),
    hasSignedUp: boolean('has_signed_up').notNull(),
    ...TIMESTAMP_FIELDS,
});

export const selectTeacherSchema = createSelectSchema(teacherProfileTable);
export type SelectTeacherSchema = z.infer<typeof selectTeacherSchema>;

export const insertTeacherSchema = createInsertSchema(teacherProfileTable);
export type InsertTeacherSchema = z.infer<typeof insertTeacherSchema>;
