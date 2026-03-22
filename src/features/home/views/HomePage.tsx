import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useEvents } from '@/features/events';
import { EventCard } from '../components/EventCard';
import { GetParticipants } from '@/features/participants';
import { HttpParticipantRepository } from '@/features/participants';
import { AddParticipant } from '@/features/participants';
import { ParticipantStatus } from '@/features/participants';
import { AddParticipantModal } from '@/features/participants';
import './HomeView.css';

interface HomePageProps {
  user: { id: string; email: string };
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { events, loading } = useEvents();
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
            counts[event.id] = participants.filter(
              p => p.status === ParticipantStatus.CONFIRMED
            ).length;
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
        [eventId]: participants.filter(
          p => p.status === ParticipantStatus.CONFIRMED
        ).length,
      }));
    } catch (error) {
      console.error(`Error loading participants for event ${eventId}:`, error);
    }
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

  return (
    <div className="home-screen">
      <div className="home-content">
        {loading ? (
          <div className="loading-events">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>No events yet.</p>
            <p>Click the "+" button below to get started!</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <EventCard
                key={event.id || `event-${index}`}
                event={event}
                participantCount={participantCounts[event.id] || 0}
                currentUserEmail={user.email}
                onClick={() => navigate(`/events/${event.id}`)}
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
