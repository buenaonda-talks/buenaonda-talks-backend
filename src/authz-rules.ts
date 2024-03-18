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
})(async ({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const isAdmin = await DB.query.adminProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
        columns: {
            id: true,
        },
    });

    if (!isAdmin) {
        return false;
    }

    return true;
});

const IsStudent = preExecRule({
    error: 'No tienes permisos para realizar esta acción',
})(async ({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const student = await DB.query.studentProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
        columns: {
            id: true,
        },
    });

    if (!student) {
        return false;
    }

    return true;
});

const IsTeacher = preExecRule({
    error: 'No tienes permisos para realizar esta acción',
})(async ({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const teacher = await DB.query.teacherProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
        columns: {
            id: true,
        },
    });

    if (!teacher) {
        return false;
    }

    return true;
});

const IsVerifiedTeacher = preExecRule({
    error: 'No tienes permisos para realizar esta acción',
})(async ({ USER, DB }: YogaContext) => {
    if (!USER) {
        return false;
    }

    const teacher = await DB.query.teacherProfileTable.findFirst({
        where: (etc, { eq }) => eq(etc.userId, USER.id),
        columns: {
            id: true,
            isVerified: true,
        },
    });

    if (!teacher || !teacher.isVerified) {
        return false;
    }

    return true;
});

export const authzRules = {
    IsAuthenticated,
    IsAdmin,
    IsStudent,
    IsTeacher,
    IsVerifiedTeacher,
} as const;
