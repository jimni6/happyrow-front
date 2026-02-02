import { createContext } from 'react';
import type {
  Resource,
  ResourceCreationRequest,
  ResourceUpdateRequest,
} from '../types/Resource';

export interface ResourcesContextType {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  loadResources: (eventId: string) => Promise<void>;
  addResource: (data: ResourceCreationRequest) => Promise<Resource>;
  updateResource: (
    id: string,
    data: ResourceUpdateRequest
  ) => Promise<Resource>;
  deleteResource: (id: string) => Promise<void>;
  addContribution: (
    resourceId: string,
    userId: string,
    quantity: number
  ) => Promise<void>;
  refreshResource: () => Promise<void>;
}

export const ResourcesContext = createContext<ResourcesContextType | undefined>(
  undefined
);
