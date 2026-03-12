import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { useResources, ResourceCategory } from '@/features/resources';
import type { Event } from '../types/Event';
import { Modal } from '@/shared/components/Modal';
import { UpdateEventForm } from '../components/UpdateEventForm';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ResourceCategorySection } from '../components/ResourceCategorySection';
import { useParticipants } from '../hooks/useParticipants';
import { useEventActions } from '../hooks/useEventActions';
import {
  ParticipantList,
  AddParticipantModal,
  HttpParticipantRepository,
  AddParticipant,
  RemoveParticipant,
  ParticipantStatus,
} from '@/features/participants';
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
  const {
    resources,
    loading,
    error: resourceError,
    loadResources,
    addResource,
    addContribution,
    updateContribution,
    deleteContribution,
  } = useResources();

  const { participants, loadParticipants } = useParticipants({
    eventId: event.id,
    session,
  });

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);

  const participantRepository = useMemo(
    () => new HttpParticipantRepository(() => session?.accessToken || null),
    [session]
  );

  const handleAddParticipant = useCallback(
    async (email: string) => {
      const addParticipant = new AddParticipant(participantRepository);
      await addParticipant.execute({
        eventId: event.id,
        userEmail: email,
        status: ParticipantStatus.INVITED,
      });
      await loadParticipants();
    },
    [event.id, participantRepository, loadParticipants]
  );

  const handleRemoveParticipant = useCallback(
    async (userEmail: string) => {
      const removeParticipant = new RemoveParticipant(participantRepository);
      await removeParticipant.execute({ eventId: event.id, userEmail });
      await loadParticipants();
    },
    [event.id, participantRepository, loadParticipants]
  );

  const {
    currentEvent,
    syncEvent,
    error,
    clearError,
    isEditModalOpen,
    setIsEditModalOpen,
    isUpdating,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    handleUpdateEvent,
    handleDeleteEvent,
  } = useEventActions({ event, user, onEventUpdated, onEventDeleted });

  useEffect(() => {
    syncEvent(event);
    loadResources(event.id);
  }, [event, event.id, loadResources, syncEvent]);

  const handleAddResource = async (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => {
    if (!user) return;
    await addResource({ eventId: event.id, ...data });
  };

  const handleAddContribution = async (
    resourceId: string,
    quantity: number
  ) => {
    if (!user) return;
    await addContribution(resourceId, user.id, quantity);
  };

  const handleUpdateContribution = async (
    resourceId: string,
    quantity: number
  ) => {
    if (!user) return;
    await updateContribution(resourceId, user.id, quantity);
  };

  const handleDeleteContribution = async (resourceId: string) => {
    if (!user) return;
    await deleteContribution(resourceId);
  };

  const participantCount = participants.length;

  // Backend returns email in 'creator' field, not UUID
  const isOrganizer =
    user?.id === currentEvent.organizerId ||
    user?.email === currentEvent.organizerId;

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
          <ResourceCategorySection
            title="Food"
            category={ResourceCategory.FOOD}
            resources={resourcesByCategory.FOOD}
            currentUserId={user?.email || ''}
            onAddContribution={handleAddContribution}
            onUpdateContribution={handleUpdateContribution}
            onDeleteContribution={handleDeleteContribution}
            onAddResource={handleAddResource}
          />
          <ResourceCategorySection
            title="Drinks"
            category={ResourceCategory.DRINK}
            resources={resourcesByCategory.DRINK}
            currentUserId={user?.email || ''}
            onAddContribution={handleAddContribution}
            onUpdateContribution={handleUpdateContribution}
            onDeleteContribution={handleDeleteContribution}
            onAddResource={handleAddResource}
          />
        </div>
      )}

      <div className="participants-section">
        <div className="participants-section-header">
          <h2 className="participants-section-title">
            <span className="meta-icon">👥</span> Participants
          </h2>
          {isOrganizer && (
            <button
              className="add-participant-btn"
              onClick={() => setIsAddParticipantOpen(true)}
            >
              + Add
            </button>
          )}
        </div>
        <ParticipantList
          participants={participants}
          currentUserEmail={user?.email || ''}
          onRemove={isOrganizer ? handleRemoveParticipant : undefined}
        />
      </div>

      {isOrganizer && (
        <button
          className="delete-event-button"
          onClick={() => setIsDeleteModalOpen(true)}
          aria-label="Delete event"
        >
          Delete Event
        </button>
      )}

      <AddParticipantModal
        isOpen={isAddParticipantOpen}
        onClose={() => setIsAddParticipantOpen(false)}
        onSubmit={handleAddParticipant}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          clearError();
        }}
        title="Edit Event"
        size="medium"
      >
        <UpdateEventForm
          event={currentEvent}
          onSubmit={handleUpdateEvent}
          onCancel={() => {
            setIsEditModalOpen(false);
            clearError();
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
          clearError();
        }}
        loading={isDeleting}
      />
    </div>
  );
};
