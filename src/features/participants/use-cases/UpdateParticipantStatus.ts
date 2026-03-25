import type {
  Participant,
  ParticipantUpdateRequest,
  ParticipantStatus,
} from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';

export interface UpdateParticipantStatusInput {
  eventId: string;
  userId: string;
  status: string;
}

export class UpdateParticipantStatus {
  constructor(private participantRepository: ParticipantRepository) {}

  async execute(input: UpdateParticipantStatusInput): Promise<Participant> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    if (!input.status || input.status.trim().length === 0) {
      throw new Error('Valid status is required');
    }

    const request: ParticipantUpdateRequest = {
      status: input.status as ParticipantStatus,
    };

    try {
      return await this.participantRepository.updateParticipantStatus(
        input.eventId,
        input.userId,
        request
      );
    } catch (error) {
      throw new Error(
        `Failed to update participant status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
