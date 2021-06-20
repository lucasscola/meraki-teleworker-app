import { Subjects } from './subjects';

export interface MerakiNetworkCreatedEvent {
    subject: Subjects.MerakiNetworkCreated;
    data: {
        id: string;
        userId: string;
        network: {
            networkId: string,
        }
    };
}