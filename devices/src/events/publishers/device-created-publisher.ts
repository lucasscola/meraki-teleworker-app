import { Publisher, Subjects, DeviceCreatedEvent } from '@lucasscola/meraki-selfservice';

export class DeviceCreatedPublisher extends Publisher<DeviceCreatedEvent> {
    subject: Subjects.DeviceCreated = Subjects.DeviceCreated;
}
