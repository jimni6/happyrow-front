import type { Event, EventCreationRequest } from './Event';

export interface EventRepository {
  createEvent(eventData: EventCreationRequest): Promise<Event>;
  getEventById(id: string): Promise<Event | null>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  updateEvent(
    id: string,
    eventData: Partial<EventCreationRequest>
  ): Promise<Event>;
  deleteEvent(id: string, userId: string): Promise<void>;
}
