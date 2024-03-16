import { InsertUserSchema, insertUserSchema, userTable } from '@/db/drizzle-schema';
import { YogaContext } from '@/types';
import { normalize } from '@/utils';
import { eq } from 'drizzle-orm';

type ExistsOptions = {
    DB: YogaContext['DB'];
} & (
    | {
          id: number;
      }
    | {
          forEmail: string;
      }
);

type CreateOptions = {
    DB: YogaContext['DB'];
    firstName: string;
    lastName: string;
    email: string;
    phoneCode: number | null;
    phoneNumber: number | null;
};

export const UserRepository = {
    exists: async (props: ExistsOptions) => {
        const { DB } = props;

        if ('id' in props) {
            const exists = await DB.query.userTable
                .findFirst({
                    where: (field, { eq }) => {
                        return eq(field.id, props.id);
                    },
                    columns: {
                        id: true,
                    },
                })
                .then((user) => {
                    return !!user;
                });

            return exists;
        }

        const exists = await DB.query.userTable
            .findFirst({
                where: (field, { eq }) => {
                    return eq(field.email, props.forEmail);
                },
                columns: {
                    id: true,
                },
            })
            .then((user) => {
                return !!user;
            });

        return exists;
    },
    create: async (props: CreateOptions) => {
        const valuesToParse: InsertUserSchema = {
            dateJoined: new Date(),
            email: props.email,
            firstName: props.firstName,
            lastName: props.lastName,
            normalizedFirstName: normalize(props.firstName),
            normalizedLastName: normalize(props.lastName),
            phoneCode: props.phoneCode?.toString() || null,
            phoneNumber: props.phoneNumber?.toString() || null,
        };

        const values = insertUserSchema.parse(valuesToParse);

        return await props.DB.insert(userTable)
            .values(values)
            .returning()
            .then((res) => res[0]);
    },
    update: async (props: {
        DB: YogaContext['DB'];
        id: number;
        values: Partial<Omit<InsertUserSchema, 'email'>>;
    }) => {
        return await props.DB.update(userTable)
            .set(props.values)
            .where(eq(userTable.id, props.id))
            .returning()
            .then((res) => res[0]);
    },

    // TOOD: Create a function to import a bunch of users
};
