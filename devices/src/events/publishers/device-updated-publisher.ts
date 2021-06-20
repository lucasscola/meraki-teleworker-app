import { Publisher, Subjects, DeviceUpdatedEvent } from '@lucasscola/meraki-selfservice';

export class DeviceUpdatedPublisher extends Publisher<DeviceUpdatedEvent> {
    subject: Subjects.DeviceUpdated = Subjects.DeviceUpdated;
}
