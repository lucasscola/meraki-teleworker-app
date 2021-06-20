import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DeviceUpdatedEvent } from '@lucasscola/meraki-selfservice';
import { Device } from '../../models/device';
import { queueGroupName } from './queue-group-name';

export class DeviceUpdatedListener extends Listener<DeviceUpdatedEvent> {
 subject: Subjects.DeviceUpdated = Subjects.DeviceUpdated;
 queueGroupName = queueGroupName;
 async onMessage(data: DeviceUpdatedEvent['data'], msg: Message) {
    // Get record
    const device = await Device.findIfPreviousVersion(data);
    if (!device) {
        throw new Error('Device not found');
    }

    // Modify device props
    device.set({
        network: data.network,
        userId: data.userId,
        userGroup: data.userGroup
    });

    // Save record in DB
    await device.save();

    // ACK the message
    msg.ack();
 }   
}