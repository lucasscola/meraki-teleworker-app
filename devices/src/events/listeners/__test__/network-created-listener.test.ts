import { Message } from 'node-nats-streaming';
import { MerakiNetworkCreatedEvent } from '@lucasscola/meraki-selfservice';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { MerakiNetworkCreatedListener } from '../network-created-listener';
import { Device } from '../../../models/device';


const setup = async () => {
    // Create listener
    const listener = new MerakiNetworkCreatedListener(natsWrapper.client);

    // Create device
    const userId = new mongoose.Types.ObjectId().toHexString();

    const device = Device.build({
        userId: userId,
        userGroup: 'dummy-test',
        userEmail: 'test@test.com',
        serialNumber: 'AAAA-AAAA-AAAA',
        network: {
            blueprint: 'dummy-test',
            subnet: '10.10.10.0/29'
        }
    });
    await device.save();
    
    // Create data event
    const data: MerakiNetworkCreatedEvent['data'] = {
        id: device.id,
        userId: device.userId,
        network: {
            networkId: 'abcd1234'
        }
    };

    // Create fake message - TS disabled because only ack() is defined
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('updates a device', async () => {
    // Setup
    const { listener, data, msg } = await setup();
 
    // Call onMessage function
    await listener.onMessage(data, msg);

    // Check networkId
    const device = await Device.findById(data.id);
    expect(device).toBeDefined();
    expect(device!.network.networkId).toEqual(data.network.networkId);

});

it('ACKs the message', async () => {
        // Setup
        const { listener, data, msg } = await setup();

        // Call onMessage function
        await listener.onMessage(data, msg);
    
        // Check for message acknowledged
        expect(msg.ack).toHaveBeenCalled();
});