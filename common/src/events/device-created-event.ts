import { Subjects } from './subjects';

export interface DeviceCreatedEvent {
    subject: Subjects.DeviceCreated;
    data: {
        id: string;
        serialNumber: string;
        userId: string;
        userGroup: string;
        userEmail: string;
        network: {
            blueprint: string;
            subnet: string
        }
    };
}