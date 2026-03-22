import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useEvents } from '../hooks/useEvents';
import { HttpEventRepository } from '../services/HttpEventRepository';
import { GetEventById } from '../use-cases/GetEventById';
import { EventDetailsView } from './EventDetailsView';
import type { Event } from '../types/Event';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { events } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEventByIdUseCase = useMemo(() => {
    const repository = new HttpEventRepository(
      () => session?.accessToken || null
    );
    return new GetEventById(repository);
  }, [session]);

  useEffect(() => {
    if (!eventId) {
      navigate('/', { replace: true });
      return;
    }

    const cached = events.find(e => e.id === eventId);
    if (cached) {
      setEvent(cached);
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await getEventByIdUseCase.execute({ id: eventId });
        if (fetched) {
          setEvent(fetched);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, events, getEventByIdUseCase, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleEventUpdated = (updatedEvent: Event) => {
    setEvent(updatedEvent);
  };

  const handleEventDeleted = () => {
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading event...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error || 'Event not found'}</p>
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
