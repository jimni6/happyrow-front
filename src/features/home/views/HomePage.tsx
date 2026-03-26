import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { useEvents } from '@/features/events';
import { EventCard } from '../components/EventCard';
import {
  GetParticipants,
  HttpParticipantRepository,
  AddParticipant,
  ParticipantStatus,
  AddParticipantModal,
} from '@/features/participants';
import './HomeView.css';

interface HomePageProps {
  user: User;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { events, loading, loadEvents } = useEvents();
  const [participantCounts, setParticipantCounts] = useState<
    Record<string, number>
  >({});
  const [addParticipantEventId, setAddParticipantEventId] = useState<
    string | null
  >(null);

  const participantRepository = useMemo(
    () => new HttpParticipantRepository(() => session?.accessToken || null),
    [session]
  );

  useEffect(() => {
    loadEvents(user.id);
  }, [user.id, loadEvents]);

  const loadParticipantCountsForEvent = useCallback(
    async (eventId: string) => {
      const getParticipantsUseCase = new GetParticipants(participantRepository);
      try {
        const participants = await getParticipantsUseCase.execute({ eventId });
        setParticipantCounts(prev => ({
          ...prev,
          [eventId]: participants.filter(
            p => p.status === ParticipantStatus.CONFIRMED
          ).length,
        }));
      } catch {
        setParticipantCounts(prev => ({ ...prev, [eventId]: 0 }));
      }
    },
    [participantRepository]
  );

  useEffect(() => {
    if (events.length === 0) return;
    events.forEach(event => loadParticipantCountsForEvent(event.id));
  }, [events, loadParticipantCountsForEvent]);

  const handleAddParticipant = useCallback(
    async (email: string) => {
      if (!addParticipantEventId) {
        throw new Error('No event selected');
      }

      const addParticipantUseCase = new AddParticipant(participantRepository);
      await addParticipantUseCase.execute({
        eventId: addParticipantEventId,
        userId: email,
      });

      await loadParticipantCountsForEvent(addParticipantEventId);
    },
    [
      addParticipantEventId,
      participantRepository,
      loadParticipantCountsForEvent,
    ]
  );

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="home-greeting">
          <img src="/logo.svg" alt="" className="home-greeting__logo" />
          <div>
            <div className="home-greeting__sub">Bonjour</div>
            <div className="home-greeting__name">{user.firstname}</div>
          </div>
        </div>
        <h2 className="home-section-title">Mes events</h2>
        {loading ? (
          <div className="loading-events">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>No events yet.</p>
            <p>Click the &quot;+&quot; button below to get started!</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <EventCard
                key={event.id || `event-${index}`}
                event={event}
                participantCount={participantCounts[event.id] || 0}
                currentUserId={user.id}
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
