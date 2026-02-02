import { createContext } from 'react';
import type { Event, EventCreationRequest } from '../types/Event';
import type { CreateEventInput } from '../use-cases/CreateEvent';

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  loadEvents: (organizerId: string) => Promise<void>;
  addEvent: (eventData: CreateEventInput) => Promise<Event>;
  updateEvent: (
    id: string,
    eventData: Partial<EventCreationRequest>
  ) => Promise<Event>;
  deleteEvent: (id: string, userId: string) => Promise<void>;
  refreshEvent: (id: string) => Promise<void>;
}

export const EventsContext = createContext<EventsContextType | undefined>(
  undefined
);
