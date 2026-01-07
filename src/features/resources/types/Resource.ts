export enum ResourceCategory {
  FOOD = 'FOOD',
  DRINK = 'DRINK',
  UTENSIL = 'UTENSIL',
  DECORATION = 'DECORATION',
  OTHER = 'OTHER',
}

export interface ResourceContributor {
  userId: string;
  quantity: number;
  contributedAt: Date;
}

export interface Resource {
  id: string;
  eventId: string;
  name: string;
  category: ResourceCategory;
  currentQuantity: number;
  suggestedQuantity?: number;
  contributors: ResourceContributor[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ResourceCreationRequest {
  eventId: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  suggestedQuantity?: number;
}

export interface ResourceUpdateRequest {
  name?: string;
  category?: ResourceCategory;
  quantity?: number;
  suggestedQuantity?: number;
}
