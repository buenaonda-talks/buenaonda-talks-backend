import { preExecRule } from '@graphql-authz/core';

import { YogaContext } from './types';

const IsAuthenticated = preExecRule({
    error: 'No estás autenticado',
})(({ USER }: YogaContext) => {
    if (USER) {
        return true;
    }

    return false;
});

const IsAdmin = preExecRule({
    error: 'No tienes permisos para realizar esta acción',
})(({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const isAdmin = DB.query.adminProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
    });

    if (!isAdmin) {
        return false;
    }

    return true;
});

const IsStudent = preExecRule({
    error: 'No tienes permisos para realizar esta acción',
})(({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const student = DB.query.studentProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
    });

    if (!student) {
        return false;
    }

    return true;
});

export const authzRules = {
    IsAuthenticated,
    IsAdmin,
    IsStudent,
} as const;
