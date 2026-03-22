import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useEvents } from '../hooks/useEvents';
import { EventDetailsView } from './EventDetailsView';
import type { Event } from '../types/Event';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, loading: eventsLoading, loadEvents } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!eventId) {
      navigate('/', { replace: true });
      return;
    }
    if (user?.id && events.length === 0 && !eventsLoading) {
      loadEvents(user.id);
    }
  }, [eventId, user?.id, events.length, eventsLoading, loadEvents, navigate]);

  useEffect(() => {
    if (!eventId) return;
    const found = events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
    }
  }, [eventId, events]);

  const handleBack = () => {
    navigate('/');
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvent(updatedEvent);
  };

  const handleEventDeleted = () => {
    navigate('/', { replace: true });
  };

  if (eventsLoading || (!event && events.length === 0)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Event not found</p>
        <button onClick={handleBack}>Back to events</button>
      </div>
    );
  }

  return (
    <EventDetailsView
      event={event}
      onBack={handleBack}
      onEventUpdated={handleEventUpdated}
      onEventDeleted={handleEventDeleted}
    />
  );
};
