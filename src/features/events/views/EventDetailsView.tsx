import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth';
import { useEvents } from '../hooks/useEvents';
import { useResources } from '@/features/resources';
import type { Event, EventType } from '../types/Event';
import {
  ResourceCategory,
  ResourceItem,
  InlineAddResourceForm,
} from '@/features/resources';
import type { Participant } from '@/features/participants';
import {
  HttpParticipantRepository,
  GetParticipants,
} from '@/features/participants';
import { Modal } from '@/shared/components/Modal';
import { UpdateEventForm } from '../components/UpdateEventForm';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import './EventDetailsView.css';

interface EventDetailsViewProps {
  event: Event;
  onBack: () => void;
  onEventUpdated?: (updatedEvent: Event) => void;
  onEventDeleted?: () => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  onBack,
  onEventUpdated,
  onEventDeleted,
}) => {
  const { user, session } = useAuth();
  const { updateEvent, deleteEvent } = useEvents();
  const {
    resources,
    loading,
    error: resourceError,
    loadResources,
    addResource,
    addContribution,
  } = useResources();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>(event);

  // Repositories
  const participantRepository = useMemo(
    () => new HttpParticipantRepository(() => session?.accessToken || null),
    [session]
  );

  // Use cases
  const getParticipantsUseCase = useMemo(
    () => new GetParticipants(participantRepository),
    [participantRepository]
  );

  const loadParticipants = useCallback(async () => {
    try {
      const loadedParticipants = await getParticipantsUseCase.execute({
        eventId: event.id,
      });
      setParticipants(loadedParticipants);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  }, [event.id, getParticipantsUseCase]);

  useEffect(() => {
    setCurrentEvent(event);
    loadResources(event.id);
    loadParticipants();
  }, [event, event.id, loadResources, loadParticipants]);

  const handleAddResource = async (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => {
    if (!user) return;

    try {
      await addResource({
        eventId: event.id,
        ...data,
      });
      // No need to reload - optimistic update in ResourcesProvider!
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
      throw err;
    }
  };

  const handleAddContribution = async (
    resourceId: string,
    quantity: number
  ) => {
    if (!user) return;

    try {
      await addContribution(resourceId, user.id, quantity);
      // No need to reload - optimistic update in ResourcesProvider!
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contribution'
      );
      throw err;
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

      const updatedEvent = await updateEvent(currentEvent.id, {
        name: eventData.name,
        description: eventData.description,
        date: eventData.date.toISOString(),
        location: eventData.location,
        type: eventData.type,
        organizerId: user.id,
      });

      setCurrentEvent(updatedEvent);
      setIsEditModalOpen(false);

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

  const handleDeleteEvent = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setError(null);

      await deleteEvent(currentEvent.id, user.id);

      setIsDeleteModalOpen(false);

      if (onEventDeleted) {
        onEventDeleted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const participantCount = participants.length;

  // Backend returns email in 'creator' field, not UUID
  // So we need to compare with user.email instead of user.id
  const isOrganizer =
    user?.id === currentEvent.organizerId ||
    user?.email === currentEvent.organizerId;

  // Group resources by category
  const resourcesByCategory = useMemo(() => {
    return {
      FOOD: resources.filter(r => r.category === 'FOOD'),
      DRINK: resources.filter(r => r.category === 'DRINK'),
    };
  }, [resources]);

  return (
    <div className="event-details-view">
      <div className="event-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <div className="event-header-info">
          <h1 className="event-name">{currentEvent.name}</h1>
          <div className="event-meta">
            <span className="event-meta-item">
              <span className="meta-icon">👥</span>
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </span>
            <span className="event-meta-item">
              <span className="meta-icon">📍</span>
              {currentEvent.location}
            </span>
          </div>
        </div>
        {isOrganizer && (
          <button
            className="edit-button-header"
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Edit event"
          >
            Edit
          </button>
        )}
      </div>

      {(error || resourceError) && (
        <div className="error-message">{error || resourceError}</div>
      )}

      {loading ? (
        <div className="loading-state">Loading resources...</div>
      ) : (
        <div className="categories-container">
          {/* Food Section */}
          <div className="category-section">
            <h2 className="category-title">Food</h2>
            <div className="resources-list">
              {resourcesByCategory.FOOD.map(resource => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  onAddContribution={handleAddContribution}
                />
              ))}
            </div>
            <InlineAddResourceForm
              category={ResourceCategory.FOOD}
              onSubmit={handleAddResource}
            />
          </div>

          {/* Drinks Section */}
          <div className="category-section">
            <h2 className="category-title">Drinks</h2>
            <div className="resources-list">
              {resourcesByCategory.DRINK.map(resource => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  onAddContribution={handleAddContribution}
                />
              ))}
            </div>
            <InlineAddResourceForm
              category={ResourceCategory.DRINK}
              onSubmit={handleAddResource}
            />
          </div>
        </div>
      )}

      {isOrganizer && (
        <button
          className="delete-event-button"
          onClick={() => setIsDeleteModalOpen(true)}
          aria-label="Delete event"
        >
          Delete Event
        </button>
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

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        eventName={currentEvent.name}
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setError(null);
        }}
        loading={isDeleting}
      />
    </div>
  );
};
