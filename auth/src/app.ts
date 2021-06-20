import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import passport from 'passport';
import cookieSession from 'cookie-session';


// Importing Routes 
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { ssoSigninRouter } from './routes/sso-signin';

// Importing Middleware & Errors
import { errorHandler, NotFoundError } from '@lucasscola/meraki-selfservice';

const app = express();
app.set('trust proxy', true);

// Using Middlewares
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
        maxAge: 24 * 60 * 60 * 1000  //24 hs
    })
);

// Initialize Passport
app.use(passport.initialize());

// Using routes
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(ssoSigninRouter);

// Error Handling
app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };