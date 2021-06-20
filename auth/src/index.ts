import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    // Check for needed ENV
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY not defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI not defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI not defined');
    }
    if (!process.env.AZURE_TENANT_ID) {
        throw new Error('AZURE_TENANT_ID not defined');
    }
    if (!process.env.AZURE_CLIENT_ID) {
        throw new Error('AZURE_CLIENT_ID not defined');
    }
    if (!process.env.AZURE_CLIENT_SECRET) {
        throw new Error('AZURE_CLIENT_SECRET not defined');
    }
    // Connect to MongoDB
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true 
        });   
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log(err);
    };

    // Start listening
    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });
    
};

start();