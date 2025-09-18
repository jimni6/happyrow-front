import type { Event, EventCreationRequest } from '../domain/Event';
import type { EventRepository } from '../domain/EventRepository';

export interface CreateEventInput {
  name: string;
  date: Date;
  location: string;
  type: string;
  organizerId: string;
}

export class CreateEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: CreateEventInput): Promise<Event> {
    // Validate input
    this.validateInput(input);

    // Convert to API request format
    const eventRequest: EventCreationRequest = {
      name: input.name.trim(),
      date: input.date.toISOString(),
      location: input.location.trim(),
      type: input.type.trim(),
      organizerId: input.organizerId,
    };

    try {
      return await this.eventRepository.createEvent(eventRequest);
    } catch (error) {
      throw new Error(
        `Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateInput(input: CreateEventInput): void {
    if (!input.name || input.name.trim().length < 3) {
      throw new Error('Event name must be at least 3 characters long');
    }

    if (!input.location || input.location.trim().length < 3) {
      throw new Error('Event location must be at least 3 characters long');
    }

    if (!input.type || input.type.trim().length < 2) {
      throw new Error('Event type must be at least 2 characters long');
    }

    if (!input.date) {
      throw new Error('Event date is required');
    }

    if (input.date <= new Date()) {
      throw new Error('Event date must be in the future');
    }

    if (!input.organizerId || input.organizerId.trim().length === 0) {
      throw new Error('Valid organizer ID is required');
    }
  }
}
