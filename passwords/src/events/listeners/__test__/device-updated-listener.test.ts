import { Message } from 'node-nats-streaming';
import { DeviceUpdatedEvent } from '@lucasscola/meraki-selfservice';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { DeviceUpdatedListener } from '../device-updated-listener';
import { Device } from '../../../models/device';


const setup = async () => {
    // Create listener
    const listener = new  DeviceUpdatedListener(natsWrapper.client);

    // Create device
    const id = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();

    const device = Device.build({
        id: id,
        userId: userId,
        userGroup: 'dummy-test',
        network: {blueprint: 'dummy-test'}
    });

    await device.save();

    // Create data event
    const data: DeviceUpdatedEvent['data'] = {
        id: id,
        version: 1,
        serialNumber: 'ABCD1234',
        userId: userId,
        userGroup: 'dummy-test',
        network: {
            blueprint: 'dummy-test',
            networkId: 'test1234'
        }
    };

    // Create fake message - TS disabled because only ack() is defined
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('updates and saves a device', async () => {
    // Setup
    const { listener, data, msg } = await setup();
 
    // Call onMessage function
    await listener.onMessage(data, msg);

    // Check for ticket created
    const device = await Device.findById(data.id);
    expect(device).toBeDefined();
    expect(device!.version).toEqual(data.version);
    expect(device!.userId).toEqual(data.userId);
    expect(device!.userGroup).toEqual(data.userGroup);
    expect(device!.network.blueprint).toEqual(data.network.blueprint);
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

it('prevents out of order messages', async () => {
    // Setup
    const { listener, data, msg } = await setup();

    // Modify data version
    data.version = 3;

    // Call onMessage function
    try {
        await listener.onMessage(data, msg);    
    } catch (error) {}
    

    // Check for message acknowledged
    expect(msg.ack).not.toHaveBeenCalled();
});