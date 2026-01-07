import type { Resource } from '../types/Resource';
import type { ResourceRepository } from '../types/ResourceRepository';

export class GetResources {
  constructor(private resourceRepository: ResourceRepository) {}

  async execute(params: { eventId: string }): Promise<Resource[]> {
    if (!params.eventId) {
      throw new Error('Event ID is required');
    }

    return this.resourceRepository.getResourcesByEvent(params.eventId);
  }
}
