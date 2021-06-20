import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser } from '@lucasscola/meraki-selfservice';

// Importing Routes 
import { indexDeviceRouter } from './routes/index';
import { updateDeviceRouter } from './routes/update';
import { detailsDeviceRouter } from './routes/details';
import { createDeviceRouter } from './routes/new';


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
app.use(indexDeviceRouter);
app.use(updateDeviceRouter);
app.use(detailsDeviceRouter);
app.use(createDeviceRouter);


// Error Handling
app.all('*', () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };