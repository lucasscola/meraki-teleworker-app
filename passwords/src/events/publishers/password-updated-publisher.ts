import { Publisher, Subjects, FamilyPasswordUpdatedEvent } from '@lucasscola/meraki-selfservice';

export class PasswordUpdatedPublisher extends Publisher<FamilyPasswordUpdatedEvent> {
    subject: Subjects.FamilyPasswordUpdated = Subjects.FamilyPasswordUpdated;
}
