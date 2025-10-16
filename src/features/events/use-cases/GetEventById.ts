import type { Event, EventRepository } from '../types';

export interface GetEventByIdInput {
  id: number;
}

export class GetEventById {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: GetEventByIdInput): Promise<Event | null> {
    if (!input.id || input.id < 1) {
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
