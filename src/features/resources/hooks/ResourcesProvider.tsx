import React, {
  useState,
  ReactNode,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type {
  Resource,
  ResourceCreationRequest,
  ResourceUpdateRequest,
} from '../types/Resource';
import { ResourcesContext, ResourcesContextType } from './ResourcesContext';
import {
  GetResources,
  UpdateResource,
  DeleteResource,
  HttpResourceRepository,
  CreateResource,
} from '@/features/resources';
import { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';
import { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import { HttpContributionRepository } from '@/features/contributions/services/HttpContributionRepository';

interface ResourcesProviderProps {
  children: ReactNode;
  getToken: () => string | null;
}

export const ResourcesProvider: React.FC<ResourcesProviderProps> = ({
  children,
  getToken,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Cache: track which eventId has been loaded
  const loadedEventIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  // Create repositories and use cases (memoized to prevent re-creation)
  const resourceRepository = useMemo(
    () => new HttpResourceRepository(getToken),
    [getToken]
  );
  const contributionRepository = useMemo(
    () => new HttpContributionRepository(getToken),
    [getToken]
  );

  const createResourceUseCase = useMemo(
    () => new CreateResource(resourceRepository),
    [resourceRepository]
  );
  const getResourcesUseCase = useMemo(
    () => new GetResources(resourceRepository),
    [resourceRepository]
  );
  const updateResourceUseCase = useMemo(
    () => new UpdateResource(resourceRepository),
    [resourceRepository]
  );
  const deleteResourceUseCase = useMemo(
    () => new DeleteResource(resourceRepository),
    [resourceRepository]
  );
  const addContributionUseCase = useMemo(
    () => new AddContribution(contributionRepository),
    [contributionRepository]
  );
  const updateContributionUseCase = useMemo(
    () => new UpdateContribution(contributionRepository),
    [contributionRepository]
  );
  const deleteContributionUseCase = useMemo(
    () => new DeleteContribution(contributionRepository),
    [contributionRepository]
  );

  const loadResources = useCallback(
    async (eventId: string) => {
      // Smart cache: don't reload if already loaded for this event
      if (loadedEventIdRef.current === eventId || loadingRef.current) {
        return;
      }

      // Set flags immediately to prevent concurrent calls
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      setCurrentEventId(eventId);

      try {
        const eventResources = await getResourcesUseCase.execute({
          eventId,
        });
        setResources(eventResources);
        loadedEventIdRef.current = eventId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load resources';
        setError(errorMessage);
        console.error('Error loading resources:', err);
        // Reset on error to allow retry
        loadedEventIdRef.current = null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [getResourcesUseCase]
  );

  const addResource = useCallback(
    async (data: ResourceCreationRequest): Promise<Resource> => {
      setError(null);
      try {
        const newResource = await createResourceUseCase.execute(data);
        // Optimistic update: add to local state immediately
        setResources(prev => [...prev, newResource]);
        return newResource;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create resource';
        setError(errorMessage);
        console.error('Error creating resource:', err);
        throw err;
      }
    },
    [createResourceUseCase]
  );

  const updateResource = useCallback(
    async (id: string, data: ResourceUpdateRequest): Promise<Resource> => {
      setError(null);
      // Store previous state for rollback
      const previousResources = [...resources];

      try {
        const updatedResource = await updateResourceUseCase.execute({
          id,
          data,
        });
        // Optimistic update: update in local state immediately
        setResources(prev =>
          prev.map(r => (r.id === id ? updatedResource : r))
        );
        return updatedResource;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update resource';
        setError(errorMessage);
        console.error('Error updating resource:', err);
        // Rollback on error
        setResources(previousResources);
        throw err;
      }
    },
    [updateResourceUseCase, resources]
  );

  const deleteResource = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      // Store previous state for rollback
      const previousResources = [...resources];

      try {
        await deleteResourceUseCase.execute({ id });
        // Optimistic update: remove from local state immediately
        setResources(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete resource';
        setError(errorMessage);
        console.error('Error deleting resource:', err);
        // Rollback on error
        setResources(previousResources);
        throw err;
      }
    },
    [deleteResourceUseCase, resources]
  );

  const addContribution = useCallback(
    async (
      resourceId: string,
      userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);
      // Store previous state for rollback
      const previousResources = [...resources];

      try {
        // Optimistic update: increment currentQuantity immediately
        setResources(prev =>
          prev.map(r =>
            r.id === resourceId
              ? {
                  ...r,
                  currentQuantity: r.currentQuantity + quantity,
                  contributors: [
                    ...r.contributors,
                    { userId, quantity, contributedAt: new Date() },
                  ],
                }
              : r
          )
        );

        // Make API call (POST contribution)
        if (!currentEventId) {
          throw new Error('No event context available');
        }

        await addContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          userId,
          quantity,
        });

        // Success - no GET needed, state already updated!
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add contribution';
        setError(errorMessage);
        console.error('Error adding contribution:', err);
        // Rollback on error
        setResources(previousResources);
        throw err;
      }
    },
    [addContributionUseCase, currentEventId, resources]
  );

  const updateContribution = useCallback(
    async (
      resourceId: string,
      userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);
      let previousResources: Resource[] = [];

      try {
        if (!currentEventId) {
          throw new Error('No event context available');
        }

        // Call API and get the updated contribution
        const updatedContribution = await updateContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          quantity,
        });

        // Update local state with the API response
        setResources(prev => {
          // Store previous state for rollback (use the actual current state)
          previousResources = [...prev];

          return prev.map(r => {
            if (r.id !== resourceId) {
              return r;
            }

            // IMPORTANT: The API is inconsistent with user identifiers:
            // - Resource contributors use user_id (email from backend)
            // - Contribution API uses participant_id (UUID)
            // - Frontend passes Supabase user ID
            // We need to find the contributor by trying different strategies

            const participantId = updatedContribution.userId;

            // Strategy 1: Try to find by participant_id
            let oldContributor = r.contributors.find(
              c => c.userId === participantId
            );

            // Strategy 2: If not found, try to find by the userId parameter
            if (!oldContributor) {
              oldContributor = r.contributors.find(c => c.userId === userId);
            }

            // Strategy 3: If still not found and there's only one contributor, assume it's them
            if (!oldContributor && r.contributors.length === 1) {
              oldContributor = r.contributors[0];
            }

            const oldQuantity = oldContributor?.quantity || 0;
            const deltaQuantity = updatedContribution.quantity - oldQuantity;

            // Update or add the contributor
            let updatedContributors;
            if (oldContributor) {
              // Update existing contributor - replace old ID with participant_id for consistency
              const oldUserId = oldContributor.userId;
              updatedContributors = r.contributors.map(c =>
                c.userId === oldUserId
                  ? {
                      ...c,
                      userId: participantId, // Normalize to participant_id
                      quantity: updatedContribution.quantity,
                      contributedAt: updatedContribution.createdAt,
                    }
                  : c
              );
            } else {
              // Add new contributor (shouldn't happen normally, but handle it)
              updatedContributors = [
                ...r.contributors,
                {
                  userId: participantId,
                  quantity: updatedContribution.quantity,
                  contributedAt: updatedContribution.createdAt,
                },
              ];
            }

            // Update the resource with new quantity and updated contributors
            return {
              ...r,
              currentQuantity: r.currentQuantity + deltaQuantity,
              contributors: updatedContributors,
            };
          });
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update contribution';
        setError(errorMessage);
        console.error('Error updating contribution:', err);
        // Rollback on error (only if we have a snapshot)
        if (previousResources.length > 0) {
          setResources(previousResources);
        }
        throw err;
      }
    },
    [updateContributionUseCase, currentEventId]
  );

  const deleteContribution = useCallback(
    async (resourceId: string): Promise<void> => {
      setError(null);

      try {
        if (!currentEventId) {
          throw new Error('No event context available');
        }

        await deleteContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
        });

        // Reload resources to get the updated state from backend
        const eventResources = await getResourcesUseCase.execute({
          eventId: currentEventId,
        });
        setResources(eventResources);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete contribution';
        setError(errorMessage);
        console.error('Error deleting contribution:', err);
        throw err;
      }
    },
    [deleteContributionUseCase, getResourcesUseCase, currentEventId]
  );

  const refreshResource = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // Reload all resources for the current event
      if (currentEventId) {
        const eventResources = await getResourcesUseCase.execute({
          eventId: currentEventId,
        });
        setResources(eventResources);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh resource';
      setError(errorMessage);
      console.error('Error refreshing resource:', err);
      throw err;
    }
  }, [getResourcesUseCase, currentEventId]);

  const value: ResourcesContextType = {
    resources,
    loading,
    error,
    loadResources,
    addResource,
    updateResource,
    deleteResource,
    addContribution,
    updateContribution,
    deleteContribution,
    refreshResource,
  };

  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
};
