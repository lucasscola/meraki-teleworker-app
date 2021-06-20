import mongoose from 'mongoose';
import { app } from './app';
import { MerakiNetworkCreatedListener } from './events/listeners/network-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    // Check for needed ENV
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY not defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI not defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID not defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL not defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID not defined');
    }
    if (!process.env.SUPERNET) {
        throw new Error('SUPERNET not defined');
    }
    if (!process.env.PREFIX_LENGTH) {
        throw new Error('SUPERNET not defined');
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

    // Connect to NATS
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL); 
        // Graceful shutdown
        natsWrapper.client.on('close', () => {
            console.log('Connection closed');
            process.exit();
        });
        process.on('SIGINT', () => { natsWrapper.client.close() });
        process.on('SIGTERM', () => { natsWrapper.client.close() });
        
    } catch (err) {
        console.log(err);
    };

    // Subscribe to NATS channels
    new MerakiNetworkCreatedListener(natsWrapper.client).listen();

    // Start listening
    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });
    
};

start();