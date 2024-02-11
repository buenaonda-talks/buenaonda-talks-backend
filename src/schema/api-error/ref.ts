import { schemaBuilder } from '../schema-builder';

export class ApiError {
    code: string;
    message: string;

    constructor({ code, message }: { code: string; message: string }) {
        this.code = code;
        this.message = message;
    }
}

export const ApiErrorRef = schemaBuilder.objectType(ApiError, {
    name: 'ApiError',
    description: `Representation of an API error, it's meant to be used to return errors from the API that the frontend can understand`,
    fields: (t) => ({
        code: t.exposeString('code', {}),
        message: t.exposeString('message', {}),
    }),
});
