import { Message } from 'node-nats-streaming';
import { DeviceCreatedEvent } from '@lucasscola/meraki-selfservice';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { DeviceCreatedListener } from '../device-created-listener';
import { Device } from '../../../models/device';


const setup = async () => {
    // Create listener
    const listener = new  DeviceCreatedListener(natsWrapper.client);

    // Create data event
    const data: DeviceCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        serialNumber: 'ABCD1234',
        userId: new mongoose.Types.ObjectId().toHexString(),
        userGroup: 'dummy-test',
        network: {
            blueprint: 'dummy-test'
        }
    };

    // Create fake message - TS disabled because only ack() is defined
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('creates and save a device', async () => {
    // Setup
    const { listener, data, msg } = await setup();
 
    // Call onMessage function
    await listener.onMessage(data, msg);

    // Check for ticket created
    const device = await Device.findById(data.id);
    expect(device).toBeDefined();
    expect(device!.userId).toEqual(data.userId);
    expect(device!.userGroup).toEqual(data.userGroup);
    expect(device!.network.blueprint).toEqual(data.network.blueprint);

});

it('ACKs the message', async () => {
        // Setup
        const { listener, data, msg } = await setup();

        // Call onMessage function
        await listener.onMessage(data, msg);
    
        // Check for message acknowledged
        expect(msg.ack).toHaveBeenCalled();
});