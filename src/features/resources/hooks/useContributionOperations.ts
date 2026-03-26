import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Resource } from '../types/Resource';
import type { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import type { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';
import type { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import type { GetResources } from '../use-cases/GetResources';
import { ApiError } from '@/core/errors/ApiError';

interface UseContributionOperationsParams {
  addContributionUseCase: AddContribution;
  updateContributionUseCase: UpdateContribution;
  deleteContributionUseCase: DeleteContribution;
  getResourcesUseCase: GetResources;
  currentEventId: string | null;
  resources: Resource[];
  setResources: Dispatch<SetStateAction<Resource[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export function useContributionOperations({
  addContributionUseCase,
  updateContributionUseCase,
  deleteContributionUseCase,
  getResourcesUseCase,
  currentEventId,
  resources,
  setResources,
  setError,
}: UseContributionOperationsParams) {
  const syncResources = useCallback(
    async (eventId: string) => {
      try {
        const eventResources = await getResourcesUseCase.execute({ eventId });
        setResources(eventResources);
      } catch (syncErr) {
        console.error('Background sync failed:', syncErr);
      }
    },
    [getResourcesUseCase, setResources]
  );

  const addContribution = useCallback(
    async (
      resourceId: string,
      userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);

      if (!currentEventId) {
        throw new Error('No event context available');
      }

      const previousResources = resources;

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

      try {
        await addContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          userId,
          quantity,
        });

        syncResources(currentEventId);
      } catch (err) {
        setResources(previousResources);
        if (err instanceof ApiError && err.isConflict) {
          setError('Data was modified by someone else. Refreshing...');
          syncResources(currentEventId);
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to add contribution';
          setError(errorMessage);
        }
        console.error('Error adding contribution:', err);
        throw err;
      }
    },
    [
      addContributionUseCase,
      syncResources,
      currentEventId,
      resources,
      setResources,
      setError,
    ]
  );

  const updateContribution = useCallback(
    async (
      resourceId: string,
      userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);

      if (!currentEventId) {
        throw new Error('No event context available');
      }

      const previousResources = resources;

      setResources(prev =>
        prev.map(r => {
          if (r.id !== resourceId) return r;
          const oldContributor = r.contributors.find(c => c.userId === userId);
          const oldQuantity = oldContributor?.quantity || 0;
          return {
            ...r,
            currentQuantity: r.currentQuantity - oldQuantity + quantity,
            contributors: r.contributors.map(c =>
              c.userId === userId ? { ...c, quantity } : c
            ),
          };
        })
      );

      try {
        await updateContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          quantity,
        });

        syncResources(currentEventId);
      } catch (err) {
        setResources(previousResources);
        if (err instanceof ApiError && err.isConflict) {
          setError('Data was modified by someone else. Refreshing...');
          syncResources(currentEventId);
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to update contribution';
          setError(errorMessage);
        }
        console.error('Error updating contribution:', err);
        throw err;
      }
    },
    [
      updateContributionUseCase,
      syncResources,
      currentEventId,
      resources,
      setResources,
      setError,
    ]
  );

  const deleteContribution = useCallback(
    async (resourceId: string): Promise<void> => {
      setError(null);

      if (!currentEventId) {
        throw new Error('No event context available');
      }

      try {
        await deleteContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
        });

        await syncResources(currentEventId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete contribution';
        setError(errorMessage);
        console.error('Error deleting contribution:', err);
        throw err;
      }
    },
    [
      deleteContributionUseCase,
      syncResources,
      currentEventId,
      setResources,
      setError,
    ]
  );

  const refreshResource = useCallback(async (): Promise<void> => {
    setError(null);
    try {
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
  }, [getResourcesUseCase, currentEventId, setResources, setError]);

  return {
    addContribution,
    updateContribution,
    deleteContribution,
    refreshResource,
  };
}
