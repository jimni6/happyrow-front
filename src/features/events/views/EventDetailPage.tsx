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

  // #region agent log
  fetch('http://127.0.0.1:7367/ingest/596e0e48-769d-4764-9ba5-3a8f9f7e2bb0', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'f986d0',
    },
    body: JSON.stringify({
      sessionId: 'f986d0',
      location: 'EventDetailPage.tsx:render',
      message: 'EventDetailPage render state',
      data: {
        eventId,
        userId: user?.id,
        eventsCount: events.length,
        eventsLoading,
        hasEvent: !!event,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7367/ingest/596e0e48-769d-4764-9ba5-3a8f9f7e2bb0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'f986d0',
      },
      body: JSON.stringify({
        sessionId: 'f986d0',
        location: 'EventDetailPage.tsx:findEvent',
        message: 'Looking for event in context',
        data: {
          eventId,
          eventsCount: events.length,
          found: !!found,
          eventIds: events.map(e => e.id),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
