import { natsWrapper } from './nats-wrapper';
import { DeviceCreatedListener } from './events/listeners/device-created-listener';
import { UpdatePasswordListener } from './events/listeners/family-password-updated-listener';
import MerakiClient from './api/meraki-client';


const start = async () => {
    // Check for needed ENV
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID not defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL not defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID not defined');
    }
    if (!process.env.MERAKI_ORGANIZATION_NAME) {
        throw new Error('MERAKI_ORGANIZATION_NAME not defined');
    }
    if (!process.env.MERAKI_API_TOKEN) {
        throw new Error('MERAKI_API_TOKEN not defined');
    }

    // Initialize MerakiClient
    console.log('Setting Meraki API Token...');
    MerakiClient.setApiToken(process.env.MERAKI_API_TOKEN);
    console.log('Retreiving Meraki Organization ID...');
    await MerakiClient.setOrgId(process.env.MERAKI_ORGANIZATION_NAME);
    console.log(`Organization ID obtained ${MerakiClient.organizationId}`);
    
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

        // Start listeners
        new DeviceCreatedListener(natsWrapper.client).listen();
        new UpdatePasswordListener(natsWrapper.client).listen();
        
    } catch (err) {
        console.log(err);
    };
    
};

start();