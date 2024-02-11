import { schemaBuilder } from '@/schema/schema-builder';

schemaBuilder.mutationFields((t) => ({
    helloWorld: t.field({
        type: 'String',
        resolve: () => {
            return 'Hello World!';
        },
    }),
}));
