import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { sendApplicationStatusEmailsQueue } from './jobs/send-application-status-emails/queue';
import { ensureLoggedIn } from 'connect-ensure-login';
import { Express } from 'express';
import { ExpressAdapter } from '@bull-board/express';
import { PassportStatic } from 'passport';

type Options = {
    app: Express;
    passport: PassportStatic;
    path: string;
};

export const setupBullBoard = ({ app, passport, path }: Options) => {
    const serverAdapter = new ExpressAdapter().setBasePath(path);

    createBullBoard({
        queues: [new BullAdapter(sendApplicationStatusEmailsQueue)],
        serverAdapter,
    });

    // Configure view engine to render EJS templates.
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.get(`${path}/login`, (req, res) => {
        res.render('login', { invalid: req.query.invalid === 'true' });
    });

    app.post(
        `${path}/login`,
        passport.authenticate('local', { failureRedirect: `${path}/login?invalid=true` }),
        (req, res) => {
            res.redirect(path);
        },
    );

    app.use(
        path,
        ensureLoggedIn({ redirectTo: `${path}/login` }),
        serverAdapter.getRouter(),
    );
};
