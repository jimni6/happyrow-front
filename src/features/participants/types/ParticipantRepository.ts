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
    userId: string,
    data: ParticipantUpdateRequest
  ): Promise<Participant>;
  removeParticipant(eventId: string, userId: string): Promise<void>;
}
