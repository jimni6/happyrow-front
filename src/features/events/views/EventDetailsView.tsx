import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth';
import type { Event, EventType } from '../types/Event';
import type { Contribution } from '@/features/contributions';
import { ContributionType } from '@/features/contributions';
import { ContributionList } from '@/features/contributions';
import { HttpContributionRepository } from '@/features/contributions';
import {
  AddContribution,
  DeleteContribution,
  GetContributions,
} from '@/features/contributions';
import { Modal } from '@/shared/components/Modal';
import { UpdateEventForm } from '../components/UpdateEventForm';
import { UpdateEvent } from '../use-cases/UpdateEvent';
import { HttpEventRepository } from '../services/HttpEventRepository';
import './EventDetailsView.css';

interface EventDetailsViewProps {
  event: Event;
  onBack: () => void;
  onEventUpdated?: (updatedEvent: Event) => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  onBack,
  onEventUpdated,
}) => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>(event);

  // Memoize repository and use cases to prevent recreation on every render
  const contributionRepository = useMemo(
    () => new HttpContributionRepository(),
    []
  );
  const getContributionsUseCase = useMemo(
    () => new GetContributions(contributionRepository),
    [contributionRepository]
  );
  const addContributionUseCase = useMemo(
    () => new AddContribution(contributionRepository),
    [contributionRepository]
  );
  const deleteContributionUseCase = useMemo(
    () => new DeleteContribution(contributionRepository),
    [contributionRepository]
  );

  const loadContributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContributionsUseCase.execute({ eventId: event.id });
      setContributions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load contributions'
      );
    } finally {
      setLoading(false);
    }
  }, [event.id, getContributionsUseCase]);

  useEffect(() => {
    setCurrentEvent(event);
    loadContributions();
  }, [event, loadContributions]);

  const handleAddContribution = async (
    name: string,
    quantity: number,
    type: ContributionType
  ) => {
    if (!user) return;

    try {
      const newContribution = await addContributionUseCase.execute({
        eventId: event.id,
        userId: user.id,
        name,
        quantity,
        type,
      });
      setContributions(prev => [...prev, newContribution]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contribution'
      );
    }
  };

  const handleIncrementContribution = async (id: number) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution) return;

    try {
      // Optimistic update
      setContributions(prev =>
        prev.map(c => (c.id === id ? { ...c, quantity: c.quantity + 1 } : c))
      );
      // In a real app, you'd call an update API here
    } catch (err) {
      setError('Failed to update contribution');
      console.error('Error updating contribution:', err);
      loadContributions(); // Reload on error
    }
  };

  const handleDecrementContribution = async (id: number) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution) return;

    try {
      // Optimistic update
      setContributions(prev =>
        prev.map(c => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
      );
      // In a real app, you'd call an update API here
    } catch (err) {
      setError('Failed to update contribution');
      console.error('Error updating contribution:', err);
      loadContributions(); // Reload on error
    }
  };

  const handleDeleteContribution = async (id: number) => {
    try {
      await deleteContributionUseCase.execute({ id });
      setContributions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete contribution'
      );
    }
  };

  const handleUpdateEvent = async (eventData: {
    name: string;
    description: string;
    date: Date;
    location: string;
    type: EventType;
  }) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setError(null);

      const eventRepository = new HttpEventRepository();
      const updateEventUseCase = new UpdateEvent(eventRepository);

      const updatedEvent = await updateEventUseCase.execute({
        id: currentEvent.id,
        name: eventData.name,
        description: eventData.description,
        date: eventData.date.toISOString(),
        location: eventData.location,
        type: eventData.type,
        organizerId: user.id,
      });

      setCurrentEvent(updatedEvent);
      setIsEditModalOpen(false);

      // Notify parent component if callback provided
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      console.error('Error updating event:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const foodContributions = contributions.filter(
    c => c.type === ContributionType.FOOD
  );
  const drinkContributions = contributions.filter(
    c => c.type === ContributionType.DRINK
  );

  const participantCount = new Set(contributions.map(c => c.userId)).size;

  // Check if current user is the event organizer
  const isOrganizer = user?.id === currentEvent.organizerId;

  return (
    <div className="event-details-view">
      <div className="event-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <h1 className="event-name">{currentEvent.name}</h1>
        {isOrganizer && (
          <button
            className="edit-button"
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Edit event"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="event-info-bar">
        <div className="info-item">
          <span className="info-icon">👥</span>
          <span className="info-text">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">{currentEvent.location}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading contributions...</div>
      ) : (
        <div className="contributions-container">
          <ContributionList
            title="Food"
            contributions={foodContributions}
            type={ContributionType.FOOD}
            onAdd={handleAddContribution}
            onIncrement={handleIncrementContribution}
            onDecrement={handleDecrementContribution}
            onDelete={handleDeleteContribution}
          />

          <ContributionList
            title="Drinks"
            contributions={drinkContributions}
            type={ContributionType.DRINK}
            onAdd={handleAddContribution}
            onIncrement={handleIncrementContribution}
            onDecrement={handleDecrementContribution}
            onDelete={handleDeleteContribution}
          />
        </div>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setError(null);
        }}
        title="Edit Event"
        size="medium"
      >
        <UpdateEventForm
          event={currentEvent}
          onSubmit={handleUpdateEvent}
          onCancel={() => {
            setIsEditModalOpen(false);
            setError(null);
          }}
          isLoading={isUpdating}
        />
      </Modal>
    </div>
  );
};
