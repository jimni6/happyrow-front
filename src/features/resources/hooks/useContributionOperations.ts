import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { Resource } from '../types/Resource';
import type { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import type { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';
import type { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import type { GetResources } from '../use-cases/GetResources';

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
  setResources,
  setError,
}: UseContributionOperationsParams) {
  const addContribution = useCallback(
    async (
      resourceId: string,
      userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);

      try {
        if (!currentEventId) {
          throw new Error('No event context available');
        }

        await addContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          userId,
          quantity,
        });

        const eventResources = await getResourcesUseCase.execute({
          eventId: currentEventId,
        });
        setResources(eventResources);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add contribution';
        setError(errorMessage);
        console.error('Error adding contribution:', err);
        throw err;
      }
    },
    [
      addContributionUseCase,
      getResourcesUseCase,
      currentEventId,
      setResources,
      setError,
    ]
  );

  const updateContribution = useCallback(
    async (
      resourceId: string,
      _userId: string,
      quantity: number
    ): Promise<void> => {
      setError(null);

      try {
        if (!currentEventId) {
          throw new Error('No event context available');
        }

        await updateContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          quantity,
        });

        const eventResources = await getResourcesUseCase.execute({
          eventId: currentEventId,
        });
        setResources(eventResources);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update contribution';
        setError(errorMessage);
        console.error('Error updating contribution:', err);
        throw err;
      }
    },
    [
      updateContributionUseCase,
      getResourcesUseCase,
      currentEventId,
      setResources,
      setError,
    ]
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
    [
      deleteContributionUseCase,
      getResourcesUseCase,
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
