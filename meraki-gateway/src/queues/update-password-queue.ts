import Queue from 'bull';
import { MerakiNetworkCreatedPublisher } from '../events/publishers/network-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import MerakiClient from '../api/meraki-client';

// TS Interface to describe Job object
interface Payload {
    networkId: string,
    newPassword: string
}

// Create Queue in Bull
const updatePasswordQueue = new Queue<Payload>('password:update', {
    redis: {
        host: process.env.REDIS_HOST,
    }
});

updatePasswordQueue.on('completed', (job) => {
    console.log(`Job ID: ${job.id} completed succesfully`);
});

updatePasswordQueue.on('failed', (job, err) => {
    console.log(`Job ID: ${job.id} failed: ${err.message}`);
});

updatePasswordQueue.process(async (job, done) => {
    // Gather needed info
    console.log('Processing job: ', job.id,' for networkId ', job.data.networkId);


    // Edit Home SSID with new password
    // For Home: SSID 2
    try {
        await  MerakiClient.changePassword(job.data.networkId, '2', job.data.newPassword);
        console.log(`Job ID: ${job.id} - Home SSID updated`);
    } catch (error) {
        return done(new Error(`Error updating home SSID ${error.message}`));
    }
    
    // DONE! Emit an event
    // new MerakiNetworkCreatedPublisher(natsWrapper.client).publish({
    //     id: job.data.id,
    //     userId: job.data.userId,
    //     network: {
    //         networkId: newNetworkId
    //     }
    // });
    done();
});

export { updatePasswordQueue };