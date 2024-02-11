import { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';

export const configurePassport = (passport: PassportStatic) => {
    passport.use(
        new Strategy(function (username, password, cb) {
            if (
                username === process.env.BULL_ADMIN_USERNAME &&
                password === process.env.BULL_ADMIN_PASSWORD
            ) {
                return cb(null, { user: 'bull-board' });
            }
            return cb(null, false);
        }),
    );

    passport.serializeUser((user, cb) => {
        cb(null, user);
    });

    passport.deserializeUser((user, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cb(null, user as any);
    });
};
