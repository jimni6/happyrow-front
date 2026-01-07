import type {
  Resource,
  ResourceCreationRequest,
  ResourceUpdateRequest,
} from './Resource';

export interface ResourceRepository {
  createResource(data: ResourceCreationRequest): Promise<Resource>;
  getResourcesByEvent(eventId: string): Promise<Resource[]>;
  getResourceById(id: string): Promise<Resource | null>;
  updateResource(id: string, data: ResourceUpdateRequest): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
}
