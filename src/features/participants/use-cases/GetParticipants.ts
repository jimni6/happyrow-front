import type { Participant } from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';

export interface GetParticipantsInput {
  eventId: string;
}

export class GetParticipants {
  constructor(private participantRepository: ParticipantRepository) {}

  async execute(input: GetParticipantsInput): Promise<Participant[]> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    try {
      return await this.participantRepository.getParticipantsByEvent(
        input.eventId
      );
    } catch (error) {
      throw new Error(
        `Failed to get participants: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
