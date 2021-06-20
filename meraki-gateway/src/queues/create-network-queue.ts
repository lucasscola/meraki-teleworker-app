import Queue from 'bull';
import { MerakiNetworkCreatedPublisher } from '../events/publishers/network-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import MerakiClient from '../api/meraki-client';

// TS Interface to describe Job object
interface Payload {
    id: string;
    serialNumber: string;
    userId: string;
    userGroup: string;
    userEmail: string;
    network: {
        blueprint: string;
        subnet: string;
    };
}

// Create Queue in Bull
const createNetworkQueue = new Queue<Payload>('network:create', {
    redis: {
        host: process.env.REDIS_HOST,
    }
});

createNetworkQueue.on('completed', (job) => {
    console.log(`Job ID: ${job.id} completed succesfully`);
});

createNetworkQueue.on('failed', (job, err) => {
    console.log(`Job ID: ${job.id} failed: ${err.message}`);
});

createNetworkQueue.process(async (job, done) => {
    // Gather needed info
    console.log('Processing job: ', job.id,' for device SN ', job.data.serialNumber);
    // Emit Job in progress Event (for client tracking) ?


    // Check for SN to be already uploaded in Organization:
    if (await MerakiClient.checkDeviceSN(job.data.serialNumber) == false) {
        return done(new Error('Error creating new network: SN is not available in the Organization inventory'));
    }

    // Creating new network
    let newNetworkId;

    try {
        newNetworkId = await MerakiClient.createNetworkFromBlueprint(job.data.network.blueprint, job.data.userEmail, job.data.network.subnet);
        console.log(`Job ID: ${job.id} - New Network created: ${newNetworkId}`);
    } catch (error) {
        return done(new Error(`Error creating new network: ${error.message}`));
    }

    // Claim device to the network
    try {
        await  MerakiClient.addDevice(job.data.serialNumber, newNetworkId);
        console.log(`Job ID: ${job.id} - Device with SN ${job.data.serialNumber} added to Netwok ${newNetworkId}`);
    } catch (error) {
        return done(new Error(`Error adding device to the network ${error.message}`));
    }

    // Edit SSID with username
    // For Corporate: SSID 1
    const username = job.data.userEmail.split('@')[0];
    try {
        await  MerakiClient.changeSSIDName(newNetworkId, '1', `${username}_Corporate`);
        console.log(`Job ID: ${job.id} - Corporate SSID updated`);
    } catch (error) {
        return done(new Error(`Error updating corporate SSID ${error.message}`));
    }

    // For Home: SSID 2
    try {
        await  MerakiClient.changeSSIDName(newNetworkId, '2', `${username}_Home`);
        console.log(`Job ID: ${job.id} - Home SSID updated`);
    } catch (error) {
        return done(new Error(`Error updating home SSID ${error.message}`));
    }
    
    // DONE! Emit an event
    new MerakiNetworkCreatedPublisher(natsWrapper.client).publish({
        id: job.data.id,
        userId: job.data.userId,
        network: {
            networkId: newNetworkId
        }
    });
    done();
});

export { createNetworkQueue };