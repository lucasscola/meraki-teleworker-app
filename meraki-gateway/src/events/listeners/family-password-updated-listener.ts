import { Message } from 'node-nats-streaming';
import { Listener, Subjects, FamilyPasswordUpdatedEvent } from '@lucasscola/meraki-selfservice';
import { queueGroupName } from './queue-group-name';
import { updatePasswordQueue } from '../../queues/update-password-queue';

export class UpdatePasswordListener extends Listener<FamilyPasswordUpdatedEvent> {
    subject: Subjects.FamilyPasswordUpdated = Subjects.FamilyPasswordUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: FamilyPasswordUpdatedEvent['data'], msg: Message) {
        // Create new Job and queue it
        // Upload to Meraki cloud
 
        await updatePasswordQueue.add({
            networkId: data.networkId,
            newPassword: data.newPassword
        });

        // ACK the event
        msg.ack();

    }
}