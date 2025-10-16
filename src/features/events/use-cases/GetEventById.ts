import type { Event, EventRepository } from '../types';

export interface GetEventByIdInput {
  id: string;
}

export class GetEventById {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: GetEventByIdInput): Promise<Event | null> {
    if (!input.id || input.id.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    try {
      return await this.eventRepository.getEventById(input.id);
    } catch (error) {
      throw new Error(
        `Failed to get event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
