import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser } from '@lucasscola/meraki-selfservice';

// Importing Routes 
import { updatePasswordRouter } from './routes/update';



// Importing Middleware & Errors
import { errorHandler, NotFoundError } from '@lucasscola/meraki-selfservice';

const app = express();
app.set('trust proxy', true);

// Using middlewares
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test'   
    })
);
app.use(currentUser);

// Using routes
app.use(updatePasswordRouter);



// Error Handling
app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };