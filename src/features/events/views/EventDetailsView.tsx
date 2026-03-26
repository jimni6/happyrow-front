import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useResources, ResourceCategory } from '@/features/resources';
import type { Event } from '../types/Event';
import { Modal } from '@/shared/components/Modal';
import { UpdateEventForm } from '../components/UpdateEventForm';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ResourceCategorySection } from '../components/ResourceCategorySection';
import { MyContributionsList } from '../components/MyContributionsList';
import { useParticipants } from '../hooks/useParticipants';
import { useEventActions } from '../hooks/useEventActions';
import { ApiError } from '@/core/errors/ApiError';
import {
  ParticipantList,
  AddParticipantModal,
  HttpParticipantRepository,
  AddParticipant,
  RemoveParticipant,
  UpdateParticipantStatus,
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
  const navigate = useNavigate();
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
    refreshResource,
  } = useResources();

  const {
    participants,
    loadParticipants,
    forbidden: participantsForbidden,
  } = useParticipants({
    eventId: event.id,
    session,
  });

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(false);

  const participantRepository = useMemo(
    () => new HttpParticipantRepository(() => session?.accessToken || null),
    [session]
  );

  const handleAddParticipant = useCallback(
    async (email: string) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const addParticipant = new AddParticipant(participantRepository);
        await addParticipant.execute({
          eventId: event.id,
          userId: email,
        });
        await loadParticipants();
      } catch (err) {
        if (err instanceof ApiError && err.isForbidden) {
          setForbiddenError(true);
        }
        throw err;
      }
    },
    [event.id, user, participantRepository, loadParticipants]
  );

  const handleRemoveParticipant = useCallback(
    async (userId: string) => {
      const removeParticipant = new RemoveParticipant(participantRepository);
      await removeParticipant.execute({ eventId: event.id, userId });
      await loadParticipants();
    },
    [event.id, participantRepository, loadParticipants]
  );

  const handleUpdateParticipantStatus = useCallback(
    async (userId: string, status: ParticipantStatus) => {
      const updateStatus = new UpdateParticipantStatus(participantRepository);
      await updateStatus.execute({
        eventId: event.id,
        userId,
        status,
      });
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
    // The backend records the creator as a contributor, but the POST response
    // may not include it. Refresh to sync contributor data immediately.
    refreshResource();
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

  const participantCount = participants.filter(
    p => p.status === ParticipantStatus.CONFIRMED
  ).length;

  const isOrganizer = user?.id === currentEvent.organizerId;

  const resourcesByCategory = useMemo(() => {
    const sortByName = (a: { name: string }, b: { name: string }) =>
      a.name.localeCompare(b.name);
    return {
      FOOD: resources.filter(r => r.category === 'FOOD').sort(sortByName),
      DRINK: resources.filter(r => r.category === 'DRINK').sort(sortByName),
    };
  }, [resources]);

  const myContributions = useMemo(() => {
    const currentUserId = user?.id || '';
    return resources
      .filter(r => r.contributors.some(c => c.userId === currentUserId))
      .map(r => ({
        resourceId: r.id,
        resourceName: r.name,
        category: r.category,
        quantity: r.contributors.find(c => c.userId === currentUserId)!
          .quantity,
      }));
  }, [resources, user?.id]);

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
              <span className="meta-icon" aria-hidden="true">
                👥
              </span>
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </span>
            <span className="event-meta-item">
              <span className="meta-icon" aria-hidden="true">
                📍
              </span>
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

      {(forbiddenError || participantsForbidden) && (
        <div className="error-message forbidden-error">
          You do not have access to this event.
          <button className="forbidden-back-btn" onClick={() => navigate('/')}>
            Back to events
          </button>
        </div>
      )}

      {(error || resourceError) && !forbiddenError && (
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
            currentUserId={user?.id || ''}
            onAddContribution={handleAddContribution}
            onUpdateContribution={handleUpdateContribution}
            onDeleteContribution={handleDeleteContribution}
            onAddResource={handleAddResource}
          />
          <ResourceCategorySection
            title="Drinks"
            category={ResourceCategory.DRINK}
            resources={resourcesByCategory.DRINK}
            currentUserId={user?.id || ''}
            onAddContribution={handleAddContribution}
            onUpdateContribution={handleUpdateContribution}
            onDeleteContribution={handleDeleteContribution}
            onAddResource={handleAddResource}
          />
        </div>
      )}

      <MyContributionsList contributions={myContributions} />

      <div className="participants-section">
        <div className="participants-section-header">
          <h2 className="participants-section-title">
            <span className="meta-icon" aria-hidden="true">
              👥
            </span>{' '}
            Participants
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
          currentUserId={user?.id || ''}
          onRemove={isOrganizer ? handleRemoveParticipant : undefined}
          onUpdateStatus={handleUpdateParticipantStatus}
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
