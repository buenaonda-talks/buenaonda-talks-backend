import SchemaBuilder from '@pothos/core';
import AuthzPlugin from '@pothos/plugin-authz';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import RelayPlugin from '@pothos/plugin-relay';
import { authzRules } from '../authz-rules';
import { YogaContext } from '../types';

export const schemaBuilder = new SchemaBuilder<{
    Context: YogaContext;
    AuthZRule: keyof typeof authzRules;
    Scalars: {
        Date: {
            Input: Date;
            Output: Date;
        };
        DateTime: {
            Input: Date;
            Output: Date;
        };
    };
}>({
    plugins: [AuthzPlugin, RelayPlugin],
    relayOptions: {
        clientMutationId: 'omit',
        cursorType: 'String',
    },
});

schemaBuilder.queryType({});
schemaBuilder.mutationType({});
schemaBuilder.addScalarType('Date', DateResolver, {});
schemaBuilder.addScalarType('DateTime', DateTimeResolver, {});
