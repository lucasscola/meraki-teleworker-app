import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DeviceCreatedEvent } from '@lucasscola/meraki-selfservice';
import { Device } from '../../models/device';
import { queueGroupName } from './queue-group-name';

export class DeviceCreatedListener extends Listener<DeviceCreatedEvent> {
 subject: Subjects.DeviceCreated = Subjects.DeviceCreated;
 queueGroupName = queueGroupName;
 async onMessage(data: DeviceCreatedEvent['data'], msg: Message) {
    // Create record
    const device = Device.build({
        id: data.id,
        userId: data.userId,
        userGroup: data.userGroup,
        network: data.network
    });
    // Save record in DB
    await device.save();

    // ACK the message
    msg.ack();
 }   
}