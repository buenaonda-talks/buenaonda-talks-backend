import { blob, index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
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

export type SelectUserSchema = z.infer<typeof selectUsersSchema>;

export const userTable = sqliteTable(
    'users_usermodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),

        sub: text('sub'),
        email: text('email').notNull(),

        dateJoined: int('date_joined', {
            mode: 'timestamp_ms',
        }).notNull(),

        firstName: text('first_name').notNull(),
        normalizedFirstName: text('normalized_first_name').notNull(),

        lastName: text('last_name').notNull(),
        normalizedLastName: text('normalized_last_name').notNull(),

        phoneCode: text('phone_code'),
        phoneNumber: text('phone_number'),
        whatsappStatus: int('whatsapp_status').notNull().default(WhatsappStatus.UNKNOWN),

        birthdate: int('birthdate', {
            mode: 'timestamp',
        }),

        isSuperAdmin: int('isSuperAdmin', { mode: 'boolean' }).default(false),
        isStudent: int('isStudent', { mode: 'boolean' }).default(false),
        isTeacher: int('isTeacher', { mode: 'boolean' }).default(false),
        isAdmin: int('isAdmin', { mode: 'boolean' }).default(false),
        isBoardMember: int('isBoardMember', { mode: 'boolean' }).default(false),
        isInterested: int('isInterested', { mode: 'boolean' }).default(false),

        emailVerified: int('emailVerified', { mode: 'boolean' }).default(false),
        imageUrl: text('imageUrl'),
        username: text('username', { length: 64 }),
        twoFactorEnabled: int('twoFactorEnabled', { mode: 'boolean' }),
        unsafeMetadata: blob('unsafeMetadata'),
        publicMetadata: blob('publicMetadata'),
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

export const selectUsersSchema = createSelectSchema(userTable);
export const insertUsersSchema = createInsertSchema(userTable);

export const boardMemberTable = sqliteTable('generations_boardmembermodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: int('created_on').notNull(),
    modifiedOn: int('modified_on').notNull(),
    userId: int('user_id')
        .notNull()
        .references(() => userTable.id),
});

export const studentProfileTable = sqliteTable(
    'generations_studentmodel',
    {
        id: int('id').primaryKey({ autoIncrement: true }).notNull(),
        allowsWhatsapp: int('allows_whatsapp'),
        discordLinkWasClicked: int('discord_link_was_clicked', {
            mode: 'boolean',
        }).notNull(),
        discordLinkClickDate: int('discord_link_click_date', {
            mode: 'timestamp_ms',
        }),
        nationality: text('nationality'),
        observations: text('observations'),
        userId: int('user_id')
            .notNull()
            .references(() => userTable.id),
        specialization: text('specialization'),
        completedProfile: int('completed_profile', {
            mode: 'boolean',
        }).notNull(),
        alreadyCreatedBySignup: int('already_created_by_signup', {
            mode: 'boolean',
        }).notNull(),
        signupDatetime: int('signup_datetime', {
            mode: 'timestamp_ms',
        }),
        collegeId: int('college_id').references(() => collegeTable.id),
        organizationId: int('organization_id').references(() => organizationTable.id),
        expectsToDoNextYear: int('expects_to_do_next_year'),
        gender: int('gender'),
        grade: int('grade'),
        timeItTakesToSchool: int('time_it_takes_to_school'),
        willTakePaesTest: int('will_take_paes_test'),
        isStudent: int('is_student').notNull(),
        uuid: text('uuid').notNull(),
        hasUnsuscribed: int('has_unsuscribed').notNull(),
        unsubscriptionDate: int('unsubscription_date'),
        unsubscriptionReason: int('unsubscription_reason'),
        unsubscriptionText: text('unsubscription_text'),
        convocatoryId: int('convocatory_id').references(() => convocatoryTable.id),
        communeId: int('commune_id').references(() => communeTable.id),
        forAylin: int('for_aylin').notNull(),
        aylinCalled: int('aylin_called').notNull(),
        aylinCalledDate: int('aylin_called_date'),
        hasClickedWhatsappLink: int('has_clicked_whatsapp_link').notNull(),
        whatsappLinkClickDate: int('whatsapp_link_click_date'),
        note: text('note'),
        initiatedSessionWithPhoneToken: int(
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

export const selectStudentSchema = createSelectSchema(studentProfileTable);
export type SelectStudentSchema = z.infer<typeof selectStudentSchema>;

export const interestedProfileTable = sqliteTable('generations_interestedmodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: int('created_on').notNull(),
    modifiedOn: int('modified_on').notNull(),
    rol: int('rol').notNull(),
    userId: int('user_id')
        .notNull()
        .references(() => userTable.id),
});

export const adminProfileTable = sqliteTable('generations_administratormodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: int('created_on').notNull(),
    modifiedOn: int('modified_on').notNull(),
    userId: int('user_id')
        .notNull()
        .references(() => userTable.id),
});

export const teacherProfileTable = sqliteTable('generations_teachermodel', {
    id: int('id').primaryKey({ autoIncrement: true }).notNull(),
    createdOn: int('created_on').notNull(),
    modifiedOn: int('modified_on').notNull(),
    userId: int('user_id')
        .notNull()
        .references(() => userTable.id),
});
