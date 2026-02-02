import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { useEvents } from '@/features/events';
import type { Event } from '@/features/events';
import { EventCard } from '../components/EventCard';
import { EventDetailsView } from '@/features/events';
import { GetParticipants } from '@/features/participants';
import { HttpParticipantRepository } from '@/features/participants';
import { AddParticipant } from '@/features/participants';
import { ParticipantStatus } from '@/features/participants';
import { AddParticipantModal } from '@/features/participants';
import './HomeView.css';

interface HomePageProps {
  user: { id: string };
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const { session } = useAuth();
  const { events, loading } = useEvents();
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
            <p>Click the "+" button below to get started!</p>
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
      </div>

      {addParticipantEventId && (
        <AddParticipantModal
          isOpen={!!addParticipantEventId}
          onClose={() => setAddParticipantEventId(null)}
          onSubmit={handleAddParticipant}
        />
      )}
    </div>
  );
};
