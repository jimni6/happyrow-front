import type { Resource, ResourceCreationRequest } from '../types/Resource';
import type { ResourceRepository } from '../types/ResourceRepository';

export class CreateResource {
  constructor(private resourceRepository: ResourceRepository) {}

  async execute(data: ResourceCreationRequest): Promise<Resource> {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Resource name must be at least 2 characters');
    }

    if (!data.category) {
      throw new Error('Resource category is required');
    }

    if (data.quantity < 0) {
      throw new Error('Quantity must be positive');
    }

    if (data.suggestedQuantity !== undefined && data.suggestedQuantity < 0) {
      throw new Error('Suggested quantity must be positive');
    }

    return this.resourceRepository.createResource(data);
  }
}
