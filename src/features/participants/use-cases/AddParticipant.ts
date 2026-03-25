import type {
  Participant,
  ParticipantCreationRequest,
} from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';

export interface AddParticipantInput {
  eventId: string;
  userId: string;
  userName?: string;
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

    const request: ParticipantCreationRequest = {
      eventId: input.eventId,
      userId: input.userId,
      userName: input.userName,
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
