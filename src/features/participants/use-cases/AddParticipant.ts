import type {
  Participant,
  ParticipantCreationRequest,
  ParticipantStatus,
} from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';

export interface AddParticipantInput {
  eventId: string;
  userId: string;
  status: string;
}

export class AddParticipant {
  constructor(private participantRepository: ParticipantRepository) {}

  async execute(input: AddParticipantInput): Promise<Participant> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    if (!input.status || input.status.trim().length === 0) {
      throw new Error('Valid status is required');
    }

    const request: ParticipantCreationRequest = {
      eventId: input.eventId,
      userId: input.userId,
      status: input.status as ParticipantStatus,
    };

    try {
      return await this.participantRepository.addParticipant(request);
    } catch (error) {
      throw new Error(
        `Failed to add participant: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
