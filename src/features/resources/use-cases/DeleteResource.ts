import type { ResourceRepository } from '../types/ResourceRepository';

export class DeleteResource {
  constructor(private resourceRepository: ResourceRepository) {}

  async execute(params: { id: string }): Promise<void> {
    if (!params.id) {
      throw new Error('Resource ID is required');
    }

    return this.resourceRepository.deleteResource(params.id);
  }
}
