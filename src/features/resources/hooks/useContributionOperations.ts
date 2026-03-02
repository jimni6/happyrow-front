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
  resources,
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
      const previousResources = [...resources];

      try {
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

        if (!currentEventId) {
          throw new Error('No event context available');
        }

        await addContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          userId,
          quantity,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add contribution';
        setError(errorMessage);
        console.error('Error adding contribution:', err);
        setResources(previousResources);
        throw err;
      }
    },
    [addContributionUseCase, currentEventId, resources, setResources, setError]
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

        const updatedContribution = await updateContributionUseCase.execute({
          eventId: currentEventId,
          resourceId,
          quantity,
        });

        setResources(prev => {
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

            let oldContributor = r.contributors.find(
              c => c.userId === participantId
            );

            if (!oldContributor) {
              oldContributor = r.contributors.find(c => c.userId === userId);
            }

            if (!oldContributor && r.contributors.length === 1) {
              oldContributor = r.contributors[0];
            }

            const oldQuantity = oldContributor?.quantity || 0;
            const deltaQuantity = updatedContribution.quantity - oldQuantity;

            let updatedContributors;
            if (oldContributor) {
              const oldUserId = oldContributor.userId;
              updatedContributors = r.contributors.map(c =>
                c.userId === oldUserId
                  ? {
                      ...c,
                      userId: participantId,
                      quantity: updatedContribution.quantity,
                      contributedAt: updatedContribution.createdAt,
                    }
                  : c
              );
            } else {
              updatedContributors = [
                ...r.contributors,
                {
                  userId: participantId,
                  quantity: updatedContribution.quantity,
                  contributedAt: updatedContribution.createdAt,
                },
              ];
            }

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
        if (previousResources.length > 0) {
          setResources(previousResources);
        }
        throw err;
      }
    },
    [updateContributionUseCase, currentEventId, setResources, setError]
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
