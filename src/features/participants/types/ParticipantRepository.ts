import type {
  Participant,
  ParticipantCreationRequest,
  ParticipantUpdateRequest,
} from './Participant';

export interface ParticipantRepository {
  addParticipant(data: ParticipantCreationRequest): Promise<Participant>;
  getParticipantsByEvent(eventId: string): Promise<Participant[]>;
  updateParticipantStatus(
    eventId: string,
    userEmail: string,
    data: ParticipantUpdateRequest
  ): Promise<Participant>;
  removeParticipant(eventId: string, userEmail: string): Promise<void>;
}
