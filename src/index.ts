import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { env } from './env';
import { setupBullBoard } from './bullBoard';
import { configurePassport } from './passportConfig';
import { createGraphQLServer } from './createGraphQLServer';

const app = express();

// Passport Configuration
configurePassport(passport);

// Session Configuration
app.use(
    session({
        secret: env.EXPRESS_SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
    }),
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// GraphQL Server
const yoga = createGraphQLServer();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(yoga.graphqlEndpoint, yoga as any);

// Bull Board
setupBullBoard({
    path: '/admin',
    passport,
    app,
});

app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Running a GraphQL API server at http://localhost:${env.PORT}/graphql`);

    // eslint-disable-next-line no-console
    console.log(`Running a Bull UI, open http://localhost:${env.PORT}/admin`);
});
