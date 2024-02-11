import { TalkRepository } from '@/db/repository/talk';
import { schemaBuilder } from '../schema-builder';
import { TalkRef } from './ref';
import { selectTalkSchema } from '@/db/drizzle-schema';

schemaBuilder.queryFields((t) => ({
    talks: t.field({
        type: [TalkRef],
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const results = await DB.query.talkTable.findMany({
                orderBy(fields, operators) {
                    return operators.desc(fields.id);
                },
            });

            return results.map((u) => selectTalkSchema.parse(u));
        },
    }),
    currentPlatziTalk: t.field({
        type: TalkRef,
        nullable: true,
        resolve: async (parent, args, { DB }) => {
            const result = await TalkRepository.getOpenTalk(DB);

            if (!result) {
                return null;
            }

            return selectTalkSchema.parse(result);
        },
    }),
    talkById: t.field({
        type: TalkRef,
        nullable: true,
        args: {
            id: t.arg.int({
                required: true,
            }),
        },
        authz: {
            rules: ['IsAuthenticated', 'IsAdmin'],
        },
        resolve: async (parent, args, { DB }) => {
            const result = await DB.query.talkTable.findFirst({
                where: (etc, { eq }) => eq(etc.id, args.id),
            });

            if (!result) {
                return null;
            }

            return selectTalkSchema.parse(result);
        },
    }),
}));
