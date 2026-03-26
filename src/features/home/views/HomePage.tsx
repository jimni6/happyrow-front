import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { useEvents } from '@/features/events';
import type { Event } from '@/features/events';
import { HeroCard } from '../components/HeroCard';
import { TimelineEvent } from '../components/TimelineEvent';
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

function splitEvents(events: Event[]): {
  nextEvent: Event | null;
  upcomingEvents: Event[];
} {
  const now = new Date();
  const future = events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    nextEvent: future[0] ?? null,
    upcomingEvents: future.slice(1),
  };
}

function isEventFar(event: Event): boolean {
  const MS_PER_DAY = 86_400_000;
  const daysUntil = (new Date(event.date).getTime() - Date.now()) / MS_PER_DAY;
  return daysUntil > 30;
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

  const { nextEvent, upcomingEvents } = useMemo(
    () => splitEvents(events),
    [events]
  );

  if (loading) {
    return (
      <div className="home-screen">
        <div className="home-content">
          <div className="home-loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <div className="home-content">
        <div className="home-greeting">
          <div className="home-greeting__sub">Bonjour</div>
          <div className="home-greeting__name">{user.firstname} 👋</div>
        </div>

        {events.length === 0 ? (
          <div className="home-empty">
            <p>Pas encore d&apos;events.</p>
            <p>Appuie sur &laquo; + &raquo; pour commencer !</p>
          </div>
        ) : (
          <>
            {nextEvent && (
              <HeroCard
                event={nextEvent}
                participantCount={participantCounts[nextEvent.id] || 0}
                onClick={() => navigate(`/events/${nextEvent.id}`)}
              />
            )}

            {upcomingEvents.length > 0 && (
              <>
                <div className="home-section-label">À venir</div>
                <div className="home-timeline">
                  {upcomingEvents.map(event => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      participantCount={participantCounts[event.id] || 0}
                      isFar={isEventFar(event)}
                      onClick={() => navigate(`/events/${event.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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
