import React, {
  useState,
  ReactNode,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { Resource } from '../types/Resource';
import { ResourcesContext, ResourcesContextType } from './ResourcesContext';
import {
  GetResources,
  UpdateResource,
  DeleteResource,
  HttpResourceRepository,
  CreateResource,
} from '@/features/resources';
import { ApiError } from '@/core/errors/ApiError';
import { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';
import { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import { HttpContributionRepository } from '@/features/contributions/services/HttpContributionRepository';
import { useResourceOperations } from './useResourceOperations';
import { useContributionOperations } from './useContributionOperations';
import { useAuth } from '@/features/auth';

interface ResourcesProviderProps {
  children: ReactNode;
}

export const ResourcesProvider: React.FC<ResourcesProviderProps> = ({
  children,
}) => {
  const { session } = useAuth();
  const getToken = useCallback(() => session?.accessToken || null, [session]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const loadedEventIdRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

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
      if (loadedEventIdRef.current === eventId || loadingRef.current) {
        return;
      }

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
        if (err instanceof ApiError && err.isForbidden) {
          setError('You do not have access to this event');
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load resources';
          setError(errorMessage);
        }
        loadedEventIdRef.current = null;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [getResourcesUseCase]
  );

  const { addResource, updateResource, deleteResource } = useResourceOperations(
    {
      createResourceUseCase,
      updateResourceUseCase,
      deleteResourceUseCase,
      resources,
      setResources,
      setError,
    }
  );

  const {
    addContribution,
    updateContribution,
    deleteContribution,
    refreshResource,
  } = useContributionOperations({
    addContributionUseCase,
    updateContributionUseCase,
    deleteContributionUseCase,
    getResourcesUseCase,
    currentEventId,
    resources,
    setResources,
    setError,
  });

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
