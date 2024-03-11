/* eslint-disable no-console */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as fs from 'fs/promises';

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
                outputData += `PRAGMA foreign_keys=off;\n`;
            }

            outputData += `BEGIN TRANSACTION;\n`;

            for (const row of unorderedRows) {
                const keys = Object.keys(row).filter((key) => {
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

                const values = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = row[key];
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

                    if (value === null || value === undefined) {
                        values.push('NULL');
                        continue;
                    }

                    if (
                        typeof value === 'string' &&
                        value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)
                    ) {
                        values.push(new Date(value).getTime());
                        continue;
                    }

                    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                        const date = new Date(value);
                        const seconds = Math.floor(date.getTime() / 1000);
                        values.push(seconds);
                        continue;
                    }

                    if (typeof value === 'string') {
                        values.push(`'${value.replace(/'/g, "''")}'`);
                        continue;
                    }

                    if (typeof value === 'boolean') {
                        values.push(value ? 1 : 0);
                        continue;
                    }

                    values.push(value);
                }

                outputData += `INSERT INTO ${tableName} (${keys
                    .map((key) => `"${key}"`)
                    .join(', ')}) VALUES (${values.join(', ')});\n`;
            }

            outputData += `COMMIT;\n`;

            if (tablesWithDisabledForeignKeys.includes(tableName)) {
                outputData += `PRAGMA foreign_keys=on;\n`;
            }
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
