import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateResource } from '@/features/resources/use-cases/CreateResource';
import { GetResources } from '@/features/resources/use-cases/GetResources';
import { UpdateResource } from '@/features/resources/use-cases/UpdateResource';
import { DeleteResource } from '@/features/resources/use-cases/DeleteResource';
import type { ResourceRepository } from '@/features/resources/types/ResourceRepository';
import {
  ResourceCategory,
  type Resource,
  type ResourceCreationRequest,
} from '@/features/resources/types/Resource';

function createMockResource(overrides?: Partial<Resource>): Resource {
  return {
    id: 'resource-1',
    eventId: 'event-1',
    name: 'Paper plates',
    category: ResourceCategory.UTENSIL,
    currentQuantity: 10,
    suggestedQuantity: 20,
    contributors: [],
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createMockResourceCreationRequest(
  overrides?: Partial<ResourceCreationRequest>
): ResourceCreationRequest {
  return {
    eventId: 'event-1',
    name: 'Paper plates',
    category: ResourceCategory.UTENSIL,
    quantity: 10,
    suggestedQuantity: 20,
    ...overrides,
  };
}

function createMockResourceRepository(): ResourceRepository {
  return {
    createResource: vi.fn(),
    getResourcesByEvent: vi.fn(),
    getResourceById: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
  };
}

describe('Resource use cases', () => {
  let mockRepository: ResourceRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = createMockResourceRepository();
  });

  describe('CreateResource', () => {
    it('creates a resource successfully', async () => {
      const request = createMockResourceCreationRequest();
      const created = createMockResource({
        name: request.name,
        category: request.category,
        eventId: request.eventId,
        currentQuantity: request.quantity,
        suggestedQuantity: request.suggestedQuantity,
      });
      vi.mocked(mockRepository.createResource).mockResolvedValue(created);

      const useCase = new CreateResource(mockRepository);
      const result = await useCase.execute(request);

      expect(result).toEqual(created);
      expect(mockRepository.createResource).toHaveBeenCalledTimes(1);
      expect(mockRepository.createResource).toHaveBeenCalledWith(request);
    });
  });

  describe('GetResources', () => {
    it('fetches resources for an event', async () => {
      const resources = [
        createMockResource(),
        createMockResource({
          id: 'resource-2',
          name: 'Cups',
          category: ResourceCategory.DRINK,
        }),
      ];
      vi.mocked(mockRepository.getResourcesByEvent).mockResolvedValue(
        resources
      );

      const useCase = new GetResources(mockRepository);
      const result = await useCase.execute({ eventId: 'event-1' });

      expect(result).toEqual(resources);
      expect(mockRepository.getResourcesByEvent).toHaveBeenCalledTimes(1);
      expect(mockRepository.getResourcesByEvent).toHaveBeenCalledWith(
        'event-1'
      );
    });

    it('returns an empty array when no resources exist', async () => {
      vi.mocked(mockRepository.getResourcesByEvent).mockResolvedValue([]);

      const useCase = new GetResources(mockRepository);
      const result = await useCase.execute({ eventId: 'event-1' });

      expect(result).toEqual([]);
      expect(mockRepository.getResourcesByEvent).toHaveBeenCalledWith(
        'event-1'
      );
    });
  });

  describe('UpdateResource', () => {
    it('updates a resource successfully', async () => {
      const updated = createMockResource({
        name: 'Large plates',
        currentQuantity: 15,
      });
      vi.mocked(mockRepository.updateResource).mockResolvedValue(updated);

      const useCase = new UpdateResource(mockRepository);
      const updateData = {
        name: 'Large plates',
        quantity: 15,
      };
      const result = await useCase.execute({
        id: 'resource-1',
        data: updateData,
      });

      expect(result).toEqual(updated);
      expect(mockRepository.updateResource).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateResource).toHaveBeenCalledWith(
        'resource-1',
        updateData
      );
    });
  });

  describe('DeleteResource', () => {
    it('deletes a resource successfully', async () => {
      vi.mocked(mockRepository.deleteResource).mockResolvedValue(undefined);

      const useCase = new DeleteResource(mockRepository);
      await useCase.execute({ id: 'resource-1' });

      expect(mockRepository.deleteResource).toHaveBeenCalledTimes(1);
      expect(mockRepository.deleteResource).toHaveBeenCalledWith('resource-1');
    });
  });
});
