import { Message } from 'node-nats-streaming';
import { Listener, DeviceCreatedEvent, Subjects } from '@lucasscola/meraki-selfservice';
import { queueGroupName } from './queue-group-name';
import { createNetworkQueue } from '../../queues/create-network-queue';

export class DeviceCreatedListener extends Listener<DeviceCreatedEvent> {
    subject: Subjects.DeviceCreated = Subjects.DeviceCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: DeviceCreatedEvent['data'], msg: Message) {
        // Create new Job and queue it
        // Upload to Meraki cloud
 
        await createNetworkQueue.add({
            id: data.id,
            serialNumber: data.serialNumber,
            userId: data.userId,
            userGroup: data.userGroup,
            userEmail: data.userEmail,
            network: data.network,
        });

        // ACK the event
        msg.ack();

    }
}