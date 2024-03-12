/* eslint-disable no-console */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as fs from 'fs/promises';
import { format } from 'date-fns';

async function exportDatabaseData(dbPath: string, outputPath: string) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    try {
        const orderedTablesToExport = [
            'core_regionmodel',
            'core_communemodel',
            'users_usermodel',
            'generations_administratormodel',
            'generations_teachermodel',
            'generations_interestedmodel',
            'colleges_collegemodel',
            'colleges_collegeteacherrelationmodel',
            'organizations_organizationmodel',
            'core_scholarshipconvocatorymodel',
            'generations_studentmodel',
            'forms_addstudentformentrymodel',
            'generations_visitstologinwithphonetokenmodel',
            'core_talkmodel',
            'core_talkinscriptionmodel',
            'core_formmodel',
            'core_formfieldmodel',
            'core_formfieldoptionmodel',
            'core_formvisitmodel',
            'core_postulationsubmissionmodel',
            'core_postulationsubmissionfieldanswermodel',
            'core_postulationsubmissionhistorymodel',
            'core_scholarshipmodel',
            'core_scholarshipstatushistorymodel',
            'core_devfbatchmodel',
            'core_devfmodulemodel',
            'core_devfbatchgroupmodel',
            'core_devfmoduleprogressmodel',
            'core_platzicoursemodel',
            'core_platzicourseprogressmodel',
            'logger_servicerequest',
        ];

        const tablesWithDisabledForeignKeys = [
            'core_postulationsubmissionmodel',
            'core_formfieldmodel',
            'core_formfieldoptionmodel',
            'core_scholarshipmodel',
        ];

        const usersColumnsToIgnore = [
            'password',
            'last_login',
            'is_superuser',
            'is_staff',
            'is_active',
            'can_access_admin',
            'token_version',
            'token_sent_to_email',
            'email_verified',
        ];

        let outputData = '';

        for (const tableName of orderedTablesToExport) {
            const unorderedRows = await db.all(`SELECT * FROM ${tableName}`);

            if (tablesWithDisabledForeignKeys.includes(tableName)) {
                outputData += `ALTER TABLE ${tableName} DISABLE TRIGGER ALL;\n`;
            }

            const keys = Object.keys(unorderedRows[0]).filter((key) => {
                if (tableName === 'users_usermodel') {
                    if (usersColumnsToIgnore.includes(key)) {
                        return false;
                    }

                    return true;
                }

                return true;
            });

            if (keys.includes('student_id')) {
                keys.push('user_id');
            }

            if (tableName === 'generations_teachermodel') {
                keys.push('is_verified');
                keys.push('has_signed_up');
            }

            outputData += `BEGIN;\n`;
            outputData += `DELETE FROM ${tableName};\n`;
            outputData += `INSERT INTO ${tableName} (`;

            outputData += keys.map((key) => `"${key}"`).join(', ');

            outputData += `)\nVALUES\n`;

            for (let i = 0; i < unorderedRows.length; i++) {
                const row = unorderedRows[i];

                const values = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = row[key];

                    if (
                        key === 'hide_from_selection' ||
                        key === 'commits_to_participate' ||
                        key === 'is_visible' ||
                        key === 'assisted' ||
                        key === 'allows_whatsapp' ||
                        key === 'is_withdrawable' ||
                        key === 'discord_link_was_clicked' ||
                        key === 'is_required' ||
                        key === 'accepted_terms' ||
                        key === 'resigned' ||
                        key === 'completed_profile' ||
                        key === 'asked_to_renew' ||
                        key === 'is_important' ||
                        key === 'already_created_by_signup' ||
                        key === 'devf_added_artificially' ||
                        key === 'platzi_completed_mandatory_courses' ||
                        key === 'is_student' ||
                        key === 'has_unsuscribed' ||
                        key === 'for_aylin' ||
                        key === 'aylin_called' ||
                        key === 'has_clicked_whatsapp_link' ||
                        key === 'initiated_session_with_phone_token'
                    ) {
                        values.push(value === 0 ? 'FALSE' : 'TRUE');
                        continue;
                    }

                    if (key === 'user_id' && !value) {
                        const studentId = row['student_id'];
                        if (studentId === null || studentId === undefined) {
                            values.push(null);
                            continue;
                        }

                        const studentData = await db.get(
                            `SELECT user_id FROM generations_studentmodel WHERE id = ?`,
                            studentId,
                        );

                        values.push(studentData.user_id);
                        continue;
                    }

                    if (key === 'is_verified' || key === 'has_signed_up') {
                        values.push('TRUE');
                        continue;
                    }

                    if (value === null || value === undefined) {
                        values.push('NULL');
                        continue;
                    }

                    if (
                        typeof value === 'string' &&
                        value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
                    ) {
                        values.push(`'${format(value, "yyyy-MM-dd'T'HH:mm:ss")}'`);
                        continue;
                    }

                    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                        const date = new Date(value);
                        values.push(`'${format(date, 'yyyy-MM-dd')}'`);
                        continue;
                    }

                    if (typeof value === 'string') {
                        values.push(`'${value.replace(/'/g, "''")}'`);
                        continue;
                    }

                    if (typeof value === 'boolean') {
                        values.push(value ? 'TRUE' : 'FALSE');
                        continue;
                    }

                    values.push(value);
                }

                outputData += `(${values.join(', ')})`;

                if (i < unorderedRows.length - 1) {
                    outputData += ',\n';
                } else {
                    outputData += ';\n';
                }
            }

            outputData += `COMMIT;\n`;

            if (tablesWithDisabledForeignKeys.includes(tableName)) {
                outputData += `ALTER TABLE ${tableName} ENABLE TRIGGER ALL;\n`;
            }
        }

        for (const tableName of orderedTablesToExport) {
            outputData += `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), coalesce(max(id), 1), false) FROM ${tableName};\n`;
        }

        await fs.writeFile(outputPath, outputData);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: node script.js <path-to-sqlite-db> <path-to-output-file>');
    process.exit(1);
}

exportDatabaseData(args[0], args[1]);
