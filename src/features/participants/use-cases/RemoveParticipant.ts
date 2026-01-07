import type { ParticipantRepository } from '../types/ParticipantRepository';

export interface RemoveParticipantInput {
  eventId: string;
  userEmail: string;
}

export class RemoveParticipant {
  constructor(private participantRepository: ParticipantRepository) {}

  async execute(input: RemoveParticipantInput): Promise<void> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.userEmail || input.userEmail.trim().length === 0) {
      throw new Error('Valid user email is required');
    }

    try {
      await this.participantRepository.removeParticipant(
        input.eventId,
        input.userEmail
      );
    } catch (error) {
      throw new Error(
        `Failed to remove participant: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
