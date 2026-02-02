import React, { useState, useEffect } from 'react';
import './HomeView.css';
import type { User } from '@/features/auth';
import { useAuth } from '@/features/auth';
import type { Event } from '@/features/events';
import { Modal } from '@/shared/components/Modal';
import { CreateEventForm } from '@/features/events';
import { EventType } from '@/features/events';
import { useEvents } from '@/features/events';
import { EventDetailsView } from '@/features/events';
import { EventCard } from '../components/EventCard';
import { GetParticipants } from '@/features/participants';
import { HttpParticipantRepository } from '@/features/participants';
import { AddParticipant } from '@/features/participants';
import { ParticipantStatus } from '@/features/participants';
import { AddParticipantModal } from '@/features/participants';

interface HomeViewProps {
  user: User;
}

export const HomeView: React.FC<HomeViewProps> = ({ user }) => {
  const { session } = useAuth();
  const { events, loading, addEvent } = useEvents();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >({});
  const [addParticipantEventId, setAddParticipantEventId] = useState<
    string | null
  >(null);

  // Load events on mount
  const { loadEvents } = useEvents();

  useEffect(() => {
    loadEvents(user.id);
  }, [user.id, loadEvents]);

  // Load participant counts when events change
  useEffect(() => {
    const loadParticipantCounts = async () => {
      if (events.length === 0) return;

      const participantRepository = new HttpParticipantRepository(
        () => session?.accessToken || null
      );
      const getParticipantsUseCase = new GetParticipants(participantRepository);

      const counts: Record<string, number> = {};
      await Promise.all(
        events.map(async event => {
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
    };

    loadParticipantCounts();
  }, [events, session]);

  const loadParticipantCountsForEvent = async (eventId: string) => {
    const participantRepository = new HttpParticipantRepository(
      () => session?.accessToken || null
    );
    const getParticipantsUseCase = new GetParticipants(participantRepository);

    try {
      const participants = await getParticipantsUseCase.execute({ eventId });
      setParticipantCounts(prev => ({
        ...prev,
        [eventId]: participants.length,
      }));
    } catch (error) {
      console.error(`Error loading participants for event ${eventId}:`, error);
    }
  };

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
      await addEvent({
        ...eventData,
        organizerId: user.id,
      });

      // Success - close modal
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
    // Update the selected event (global state is already updated by EventsProvider)
    setSelectedEvent(updatedEvent);
  };

  const handleEventDeleted = () => {
    // Global state is already updated by EventsProvider
    // Just go back to home screen
    setSelectedEvent(null);
  };

  const handleAddParticipant = async (email: string) => {
    if (!addParticipantEventId) {
      throw new Error('No event selected');
    }

    const participantRepository = new HttpParticipantRepository(
      () => session?.accessToken || null
    );
    const addParticipantUseCase = new AddParticipant(participantRepository);

    await addParticipantUseCase.execute({
      eventId: addParticipantEventId,
      userEmail: email,
      status: ParticipantStatus.INVITED,
    });

    // Reload participant count for this event
    await loadParticipantCountsForEvent(addParticipantEventId);
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
        {loading ? (
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
                onAddParticipant={eventId => setAddParticipantEventId(eventId)}
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
        title="Create new event"
        size="medium"
        variant="create-event"
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

      {addParticipantEventId && (
        <AddParticipantModal
          isOpen={!!addParticipantEventId}
          onClose={() => setAddParticipantEventId(null)}
          onSubmit={handleAddParticipant}
        />
      )}

      {createEventError && (
        <div className="error-toast">{createEventError}</div>
      )}
    </div>
  );
};
