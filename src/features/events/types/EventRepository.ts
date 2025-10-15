import type { Event, EventCreationRequest } from './Event';

export interface EventRepository {
  createEvent(eventData: EventCreationRequest): Promise<Event>;
  getEventById(id: number): Promise<Event | null>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  updateEvent(
    id: number,
    eventData: Partial<EventCreationRequest>
  ): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
}
