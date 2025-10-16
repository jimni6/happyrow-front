import type { Event, EventRepository } from '../types';

export interface GetEventsByOrganizerInput {
  organizerId: string;
}

export class GetEventsByOrganizer {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: GetEventsByOrganizerInput): Promise<Event[]> {
    if (!input.organizerId || input.organizerId.trim().length === 0) {
      throw new Error('Valid organizer ID is required');
    }

    try {
      return await this.eventRepository.getEventsByOrganizer(input.organizerId);
    } catch (error) {
      throw new Error(
        `Failed to get events: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
