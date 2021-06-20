import { Subjects } from './subjects';

export interface FamilyPasswordUpdatedEvent {
    subject: Subjects.FamilyPasswordUpdated;
    data: {
        networkId: string,
        newPassword: string,
        },
}