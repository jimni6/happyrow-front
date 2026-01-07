import type { Resource, ResourceUpdateRequest } from '../types/Resource';
import type { ResourceRepository } from '../types/ResourceRepository';

export class UpdateResource {
  constructor(private resourceRepository: ResourceRepository) {}

  async execute(params: {
    id: string;
    data: ResourceUpdateRequest;
  }): Promise<Resource> {
    if (!params.id) {
      throw new Error('Resource ID is required');
    }

    if (params.data.name && params.data.name.trim().length < 2) {
      throw new Error('Resource name must be at least 2 characters');
    }

    if (params.data.quantity !== undefined && params.data.quantity < 0) {
      throw new Error('Quantity must be positive');
    }

    if (
      params.data.suggestedQuantity !== undefined &&
      params.data.suggestedQuantity < 0
    ) {
      throw new Error('Suggested quantity must be positive');
    }

    return this.resourceRepository.updateResource(params.id, params.data);
  }
}
