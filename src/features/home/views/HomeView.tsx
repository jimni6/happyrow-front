import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HomeView.css';
import type { User } from '@/features/auth';
import { useAuth } from '@/features/auth';
import type { Event } from '@/features/events';
import { Modal } from '@/shared/components/Modal';
import { CreateEventForm } from '@/features/events';
import { EventType } from '@/features/events';
import { CreateEvent, GetEventsByOrganizer } from '@/features/events';
import { HttpEventRepository } from '@/features/events';
import { EventDetailsView } from '@/features/events';
import { EventCard } from '../components/EventCard';
import { GetParticipants } from '@/features/participants';
import { HttpParticipantRepository } from '@/features/participants';

interface HomeViewProps {
  user: User;
}

export const HomeView: React.FC<HomeViewProps> = ({ user }) => {
  const { session } = useAuth();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >({});

  // Ref to track if we're currently loading to prevent duplicate calls
  const loadingRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  const loadEvents = useCallback(async () => {
    // Prevent duplicate calls for the same user
    if (loadingRef.current || loadedUserIdRef.current === user.id) {
      return;
    }

    // Set flags immediately to prevent concurrent calls
    loadingRef.current = true;
    loadedUserIdRef.current = user.id;

    try {
      setLoadingEvents(true);
      const eventRepository = new HttpEventRepository(
        () => session?.accessToken || null
      );
      const getEventsUseCase = new GetEventsByOrganizer(eventRepository);
      const userEvents = await getEventsUseCase.execute({
        organizerId: user.id,
      });
      setEvents(userEvents);

      // Load participant counts for each event
      const participantRepository = new HttpParticipantRepository(
        () => session?.accessToken || null
      );
      const getParticipantsUseCase = new GetParticipants(participantRepository);

      const counts: Record<string, number> = {};
      await Promise.all(
        userEvents.map(async event => {
          try {
            const participants = await getParticipantsUseCase.execute({
              eventId: event.id,
            });
            counts[event.id] = participants.length;
          } catch (error) {
            console.error(
              `Error loading participants for event ${event.id}:`,
              error
            );
            counts[event.id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (error) {
      console.error('Error loading events:', error);
      // Reset on error to allow retry
      loadedUserIdRef.current = null;
    } finally {
      setLoadingEvents(false);
      loadingRef.current = false;
    }
  }, [user.id, session]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (eventData: {
    name: string;
    description: string;
    date: Date;
    location: string;
    type: EventType;
  }) => {
    setIsCreatingEvent(true);
    setCreateEventError(null);

    try {
      const eventRepository = new HttpEventRepository(
        () => session?.accessToken || null
      );
      const createEventUseCase = new CreateEvent(eventRepository);

      const newEvent = await createEventUseCase.execute({
        ...eventData,
        organizerId: user.id,
      });

      // Success - add the new event to the list and close modal
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setIsCreateEventModalOpen(false);
      console.log('Event created successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create event';
      setCreateEventError(errorMessage);
      console.error('Error creating event:', error);
      throw error; // Re-throw to let modal handle it
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    // Update the event in the local list
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    // Update the selected event
    setSelectedEvent(updatedEvent);
  };

  const handleEventDeleted = () => {
    if (!selectedEvent) return;

    // Remove the event from the local list
    setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEvent.id));

    // Go back to home screen
    setSelectedEvent(null);
  };

  // Show event details if an event is selected
  if (selectedEvent) {
    return (
      <EventDetailsView
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />
    );
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        {loadingEvents ? (
          <div className="loading-events">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>You haven't created any events yet.</p>
            <p>Click "Create a new event" below to get started!</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <EventCard
                key={event.id || `event-${index}`}
                event={event}
                participantCount={participantCounts[event.id] || 0}
                onClick={() => setSelectedEvent(event)}
                showToggle={true}
              />
            ))}
          </div>
        )}

        <button
          className="btn-create-event"
          onClick={() => setIsCreateEventModalOpen(true)}
        >
          Create a new event
        </button>
      </div>

      <Modal
        isOpen={isCreateEventModalOpen}
        onClose={() => {
          setIsCreateEventModalOpen(false);
          setCreateEventError(null);
        }}
        title="Create New Event"
        size="medium"
      >
        <CreateEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => {
            setIsCreateEventModalOpen(false);
            setCreateEventError(null);
          }}
          isLoading={isCreatingEvent}
        />
      </Modal>

      {createEventError && (
        <div className="error-toast">{createEventError}</div>
      )}
    </div>
  );
};
