import { Subjects } from './subjects';

export interface DeviceUpdatedEvent {
    subject: Subjects.DeviceUpdated;
    data: {
        id: string;
        version: number;
        serialNumber: string;
        userId: string;
        userGroup: string;
        network: {
            networkId?: string;
            blueprint: string;
            subnet: string;
        };
    };
}