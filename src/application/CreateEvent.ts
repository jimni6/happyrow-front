import type { Event, EventCreationRequest, EventType } from '../domain/Event';
import type { EventRepository } from '../domain/EventRepository';

export interface CreateEventInput {
  name: string;
  description: string;
  date: Date;
  location: string;
  type: EventType;
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
      description: input.description.trim(),
      date: input.date.toISOString(),
      location: input.location.trim(),
      type: input.type,
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

    if (!input.description || input.description.trim().length < 3) {
      throw new Error('Event description must be at least 3 characters long');
    }

    if (!input.location || input.location.trim().length < 3) {
      throw new Error('Event location must be at least 3 characters long');
    }

    if (!input.type) {
      throw new Error('Event type is required');
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
