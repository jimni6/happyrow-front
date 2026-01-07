import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth';
import type { Event, EventType } from '../types/Event';
import type { Resource, ResourceCategory } from '@/features/resources';
import type { Contribution } from '@/features/contributions';
import {
  HttpResourceRepository,
  CreateResource,
  GetResources,
  ResourceItem,
  AddResourceForm,
} from '@/features/resources';
import {
  HttpContributionRepository,
  AddContribution,
  DeleteContribution,
} from '@/features/contributions';
import { Modal } from '@/shared/components/Modal';
import { UpdateEventForm } from '../components/UpdateEventForm';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { UpdateEvent } from '../use-cases/UpdateEvent';
import { DeleteEvent } from '../use-cases/DeleteEvent';
import { HttpEventRepository } from '../services/HttpEventRepository';
import './EventDetailsView.css';

interface EventDetailsViewProps {
  event: Event;
  onBack: () => void;
  onEventUpdated?: (updatedEvent: Event) => void;
  onEventDeleted?: () => void;
}

interface ResourceWithContributions {
  resource: Resource;
  contributions: Contribution[];
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  onBack,
  onEventUpdated,
  onEventDeleted,
}) => {
  const { user, session } = useAuth();
  const [resourcesWithContributions, setResourcesWithContributions] = useState<
    ResourceWithContributions[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event>(event);

  // Repositories
  const resourceRepository = useMemo(
    () => new HttpResourceRepository(() => session?.accessToken || null),
    [session]
  );
  const contributionRepository = useMemo(
    () => new HttpContributionRepository(() => session?.accessToken || null),
    [session]
  );
  const eventRepository = useMemo(
    () => new HttpEventRepository(() => session?.accessToken || null),
    [session]
  );

  // Use cases
  const getResourcesUseCase = useMemo(
    () => new GetResources(resourceRepository),
    [resourceRepository]
  );
  const createResourceUseCase = useMemo(
    () => new CreateResource(resourceRepository),
    [resourceRepository]
  );
  const addContributionUseCase = useMemo(
    () => new AddContribution(contributionRepository),
    [contributionRepository]
  );
  const deleteContributionUseCase = useMemo(
    () => new DeleteContribution(contributionRepository),
    [contributionRepository]
  );
  const updateEventUseCase = useMemo(
    () => new UpdateEvent(eventRepository),
    [eventRepository]
  );
  const deleteEventUseCase = useMemo(
    () => new DeleteEvent(eventRepository),
    [eventRepository]
  );

  const loadResourcesWithContributions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all resources for the event
      const resources = await getResourcesUseCase.execute({
        eventId: event.id,
      });

      // For each resource, load its contributions
      const resourcesWithContribs: ResourceWithContributions[] =
        await Promise.all(
          resources.map(async resource => {
            try {
              const contributions =
                await contributionRepository.getContributionsByResource({
                  eventId: event.id,
                  resourceId: resource.id,
                });
              return { resource, contributions };
            } catch (err) {
              console.error(
                `Failed to load contributions for resource ${resource.id}:`,
                err
              );
              return { resource, contributions: [] };
            }
          })
        );

      setResourcesWithContributions(resourcesWithContribs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [event.id, getResourcesUseCase, contributionRepository]);

  useEffect(() => {
    setCurrentEvent(event);
    loadResourcesWithContributions();
  }, [event, loadResourcesWithContributions]);

  const handleAddResource = async (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => {
    if (!user) return;

    try {
      const newResource = await createResourceUseCase.execute({
        eventId: event.id,
        ...data,
      });

      // If user provided initial quantity, create a contribution
      if (data.quantity > 0) {
        const contribution = await addContributionUseCase.execute({
          eventId: event.id,
          resourceId: newResource.id,
          userId: user.id,
          quantity: data.quantity,
        });
        setResourcesWithContributions(prev => [
          ...prev,
          { resource: newResource, contributions: [contribution] },
        ]);
      } else {
        setResourcesWithContributions(prev => [
          ...prev,
          { resource: newResource, contributions: [] },
        ]);
      }

      setIsAddResourceModalOpen(false);
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
      const newContribution = await addContributionUseCase.execute({
        eventId: event.id,
        resourceId,
        userId: user.id,
        quantity,
      });

      setResourcesWithContributions(prev =>
        prev.map(item =>
          item.resource.id === resourceId
            ? {
                ...item,
                contributions: [...item.contributions, newContribution],
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contribution'
      );
      throw err;
    }
  };

  const handleDeleteContribution = async (resourceId: string) => {
    if (!user) return;

    try {
      await deleteContributionUseCase.execute({
        eventId: event.id,
        resourceId,
      });

      setResourcesWithContributions(prev =>
        prev.map(item =>
          item.resource.id === resourceId
            ? {
                ...item,
                contributions: item.contributions.filter(
                  c => c.userId !== user.id
                ),
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete contribution'
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

      await deleteEventUseCase.execute({
        id: currentEvent.id,
        userId: user.id,
      });

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

  const participantIds = new Set<string>();
  resourcesWithContributions.forEach(({ contributions }) => {
    contributions.forEach(c => participantIds.add(c.userId));
  });
  const participantCount = participantIds.size;

  const isOrganizer = user?.id === currentEvent.organizerId;

  return (
    <div className="event-details-view">
      <div className="event-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <h1 className="event-name">{currentEvent.name}</h1>
        {isOrganizer && (
          <div className="event-actions">
            <button
              className="edit-button"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit event"
            >
              ✏️ Edit
            </button>
            <button
              className="delete-button-header"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete event"
            >
              🗑️ Delete
            </button>
          </div>
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

      <div className="resources-section">
        <div className="resources-header">
          <h2>Resources</h2>
          <button
            className="add-resource-btn"
            onClick={() => setIsAddResourceModalOpen(true)}
          >
            + Add Resource
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading resources...</div>
        ) : resourcesWithContributions.length === 0 ? (
          <div className="empty-state">
            <p>No resources yet. Add the first resource to get started!</p>
          </div>
        ) : (
          <div className="resources-list">
            {resourcesWithContributions.map(({ resource, contributions }) => (
              <ResourceItem
                key={resource.id}
                resource={resource}
                contributions={contributions}
                currentUserId={user?.id || ''}
                onAddContribution={handleAddContribution}
                onDeleteContribution={handleDeleteContribution}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddResourceModalOpen}
        onClose={() => setIsAddResourceModalOpen(false)}
        title="Add Resource"
        size="medium"
      >
        <AddResourceForm
          onSubmit={handleAddResource}
          onCancel={() => setIsAddResourceModalOpen(false)}
        />
      </Modal>

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
