import type { Event, EventType } from '../types/Event';
import type { EventRepository } from '../types/EventRepository';

export interface UpdateEventInput {
  id: string;
  name?: string;
  description?: string;
  date?: string;
  location?: string;
  type?: EventType;
  organizerId?: string;
}

export class UpdateEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: UpdateEventInput): Promise<Event> {
    // Validate at least one field is being updated
    const { id, ...updateData } = input;
    const hasUpdates = Object.values(updateData).some(
      value => value !== undefined
    );

    if (!hasUpdates) {
      throw new Error('At least one field must be provided for update');
    }

    // Validate name if provided
    if (input.name !== undefined && input.name.trim().length < 3) {
      throw new Error('Event name must be at least 3 characters long');
    }

    // Validate location if provided
    if (input.location !== undefined && input.location.trim().length < 3) {
      throw new Error('Event location must be at least 3 characters long');
    }

    // Validate type if provided
    if (input.type !== undefined && input.type.trim().length < 2) {
      throw new Error('Event type must be at least 2 characters long');
    }

    // Validate date if provided (must be in the future)
    if (input.date !== undefined) {
      const eventDate = new Date(input.date);
      const now = new Date();
      if (eventDate <= now) {
        throw new Error('Event date must be in the future');
      }
    }

    // Call repository to update event
    return await this.eventRepository.updateEvent(id, updateData);
  }
}
