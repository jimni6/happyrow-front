import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type {
  Resource,
  ResourceCreationRequest,
  ResourceUpdateRequest,
} from '../types/Resource';
import type { CreateResource } from '../use-cases/CreateResource';
import type { UpdateResource } from '../use-cases/UpdateResource';
import type { DeleteResource } from '../use-cases/DeleteResource';

interface UseResourceOperationsParams {
  createResourceUseCase: CreateResource;
  updateResourceUseCase: UpdateResource;
  deleteResourceUseCase: DeleteResource;
  resources: Resource[];
  setResources: Dispatch<SetStateAction<Resource[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export function useResourceOperations({
  createResourceUseCase,
  updateResourceUseCase,
  deleteResourceUseCase,
  resources,
  setResources,
  setError,
}: UseResourceOperationsParams) {
  const addResource = useCallback(
    async (data: ResourceCreationRequest): Promise<Resource> => {
      setError(null);
      try {
        const newResource = await createResourceUseCase.execute(data);
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
    [createResourceUseCase, setResources, setError]
  );

  const updateResource = useCallback(
    async (id: string, data: ResourceUpdateRequest): Promise<Resource> => {
      setError(null);
      const previousResources = [...resources];

      try {
        const updatedResource = await updateResourceUseCase.execute({
          id,
          data,
        });
        setResources(prev =>
          prev.map(r => (r.id === id ? updatedResource : r))
        );
        return updatedResource;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update resource';
        setError(errorMessage);
        console.error('Error updating resource:', err);
        setResources(previousResources);
        throw err;
      }
    },
    [updateResourceUseCase, resources, setResources, setError]
  );

  const deleteResource = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const previousResources = [...resources];

      try {
        await deleteResourceUseCase.execute({ id });
        setResources(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete resource';
        setError(errorMessage);
        console.error('Error deleting resource:', err);
        setResources(previousResources);
        throw err;
      }
    },
    [deleteResourceUseCase, resources, setResources, setError]
  );

  return { addResource, updateResource, deleteResource };
}
