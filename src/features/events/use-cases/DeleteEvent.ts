import type { EventRepository } from '../types/EventRepository';

export interface DeleteEventInput {
  id: string;
  userId: string;
}

export class DeleteEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: DeleteEventInput): Promise<void> {
    // Validation
    if (!input.id || input.id.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    try {
      await this.eventRepository.deleteEvent(input.id, input.userId);
    } catch (error) {
      throw new Error(
        `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
