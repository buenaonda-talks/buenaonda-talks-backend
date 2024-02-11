import {
    SelectStudentSchema,
    SelectUserSchema,
    selectStudentSchema,
    selectUsersSchema,
} from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import DataLoader from 'dataloader';

export const createDataLoaders = ({ DB }: YogaContext) => {
    return {
        userLoader: new DataLoader<number, SelectUserSchema>(async (ids) => {
            const results = await DB.query.userTable
                .findMany({
                    where: (fields, operators) => {
                        return operators.inArray(fields.id, [...ids]);
                    },
                })
                .then((objs) => {
                    return objs.map((o) => selectUsersSchema.parse(o));
                })
                .then((objs) => {
                    return ids.map((id) => objs[id] || new Error(`No value for ${id}`));
                });

            return results;
        }),
        studentLoader: new DataLoader<number, SelectStudentSchema>(async (ids) => {
            const results = await DB.query.studentTable
                .findMany({
                    where: (fields, operators) => {
                        return operators.inArray(fields.id, [...ids]);
                    },
                })
                .then((objs) => {
                    return objs.map((o) => selectStudentSchema.parse(o));
                })
                .then((objs) => {
                    return ids.map((id) => objs[id] || new Error(`No value for ${id}`));
                });

            return results;
        }),
    };
};
