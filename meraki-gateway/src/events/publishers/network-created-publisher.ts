import { Publisher, Subjects, MerakiNetworkCreatedEvent } from '@lucasscola/meraki-selfservice';

export class MerakiNetworkCreatedPublisher extends Publisher<MerakiNetworkCreatedEvent> {
    subject: Subjects.MerakiNetworkCreated = Subjects.MerakiNetworkCreated;
}
