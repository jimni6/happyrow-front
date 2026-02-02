import React, {
  useState,
  ReactNode,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { Event, EventCreationRequest } from '../types/Event';
import type { CreateEventInput } from '../use-cases/CreateEvent';
import { EventsContext, EventsContextType } from './EventsContext';
import { CreateEvent } from '../use-cases/CreateEvent';
import { GetEventsByOrganizer } from '../use-cases/GetEventsByOrganizer';
import { UpdateEvent } from '../use-cases/UpdateEvent';
import { DeleteEvent } from '../use-cases/DeleteEvent';
import { GetEventById } from '../use-cases/GetEventById';
import { HttpEventRepository } from '../services/HttpEventRepository';

interface EventsProviderProps {
  children: ReactNode;
  getToken: () => string | null;
}

export const EventsProvider: React.FC<EventsProviderProps> = ({
  children,
  getToken,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache: track which organizerId has been loaded
  const loadedOrganizerIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  // Create repository and use cases (memoized to prevent re-creation)
  const eventRepository = useMemo(
    () => new HttpEventRepository(getToken),
    [getToken]
  );
  const createEventUseCase = useMemo(
    () => new CreateEvent(eventRepository),
    [eventRepository]
  );
  const getEventsByOrganizerUseCase = useMemo(
    () => new GetEventsByOrganizer(eventRepository),
    [eventRepository]
  );
  const updateEventUseCase = useMemo(
    () => new UpdateEvent(eventRepository),
    [eventRepository]
  );
  const deleteEventUseCase = useMemo(
    () => new DeleteEvent(eventRepository),
    [eventRepository]
  );
  const getEventByIdUseCase = useMemo(
    () => new GetEventById(eventRepository),
    [eventRepository]
  );

  const loadEvents = useCallback(
    async (organizerId: string) => {
      // Smart cache: don't reload if already loaded for this organizer
      if (loadedOrganizerIdRef.current === organizerId || loadingRef.current) {
        return;
      }

      // Set flags immediately to prevent concurrent calls
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const userEvents = await getEventsByOrganizerUseCase.execute({
          organizerId,
        });
        setEvents(userEvents);
        loadedOrganizerIdRef.current = organizerId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load events';
        setError(errorMessage);
        console.error('Error loading events:', err);
        // Reset on error to allow retry
        loadedOrganizerIdRef.current = null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [getEventsByOrganizerUseCase]
  );

  const addEvent = useCallback(
    async (eventData: CreateEventInput): Promise<Event> => {
      setError(null);
      try {
        const newEvent = await createEventUseCase.execute(eventData);
        // Optimistic update: add to local state immediately
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMessage);
        console.error('Error creating event:', err);
        throw err;
      }
    },
    [createEventUseCase]
  );

  const updateEvent = useCallback(
    async (
      id: string,
      eventData: Partial<EventCreationRequest>
    ): Promise<Event> => {
      setError(null);
      // Store previous state for rollback
      const previousEvents = [...events];

      try {
        const updatedEvent = await updateEventUseCase.execute({
          id,
          ...eventData,
        });
        // Optimistic update: update in local state immediately
        setEvents(prev => prev.map(e => (e.id === id ? updatedEvent : e)));
        return updatedEvent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update event';
        setError(errorMessage);
        console.error('Error updating event:', err);
        // Rollback on error
        setEvents(previousEvents);
        throw err;
      }
    },
    [updateEventUseCase, events]
  );

  const deleteEvent = useCallback(
    async (id: string, userId: string): Promise<void> => {
      setError(null);
      // Store previous state for rollback
      const previousEvents = [...events];

      try {
        await deleteEventUseCase.execute({ id, userId });
        // Optimistic update: remove from local state immediately
        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete event';
        setError(errorMessage);
        console.error('Error deleting event:', err);
        // Rollback on error
        setEvents(previousEvents);
        throw err;
      }
    },
    [deleteEventUseCase, events]
  );

  const refreshEvent = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      try {
        const refreshedEvent = await getEventByIdUseCase.execute({ id });
        if (refreshedEvent) {
          setEvents(prev => prev.map(e => (e.id === id ? refreshedEvent : e)));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to refresh event';
        setError(errorMessage);
        console.error('Error refreshing event:', err);
        throw err;
      }
    },
    [getEventByIdUseCase]
  );

  const value: EventsContextType = {
    events,
    loading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvent,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};
