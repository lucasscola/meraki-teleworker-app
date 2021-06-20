import { Message } from 'node-nats-streaming';
import { Listener, MerakiNetworkCreatedEvent, Subjects } from '@lucasscola/meraki-selfservice';
import { DeviceUpdatedPublisher } from '../publishers/device-updated-publisher';
import { Device } from '../../models/device';
import { queueGroupName } from './queue-group-name';
import { natsWrapper } from '../../nats-wrapper';

export class MerakiNetworkCreatedListener extends Listener<MerakiNetworkCreatedEvent> {
    subject: Subjects.MerakiNetworkCreated = Subjects.MerakiNetworkCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: MerakiNetworkCreatedEvent['data'], msg: Message) {
        // When a Meraki network is created, the networkId of the device entry has to be updated

        // Search record in DB
        const device = await Device.findById(data.id);
        if (!device) {
            throw new Error('Device not found when trying to update networkId');
        }
        // Update the device
        device.set({
            network: {
                networkId: data.network.networkId
            }
        });
        await device.save();

        // Emit a DeviceUpdated event
        await new DeviceUpdatedPublisher(natsWrapper.client).publish({
            id: device.id,
            version: device.version,
            serialNumber: device.serialNumber,
            userId: device.userId,
            userGroup: device.userGroup,
            network: {
                blueprint: device.network.blueprint,
                networkId: device.network.networkId,
                subnet: device.network.subnet
            },
        });

        // ACK the event
        msg.ack();

    }
}