export enum ContributionType {
  FOOD = 'FOOD',
  DRINK = 'DRINK',
}

export interface Contribution {
  id: number;
  eventId: number;
  userId: string;
  name: string;
  quantity: number;
  type: ContributionType;
  createdAt: Date;
}

export interface ContributionCreationRequest {
  eventId: number;
  userId: string;
  name: string;
  quantity: number;
  type: ContributionType;
}

export interface ContributionUpdateRequest {
  name?: string;
  quantity?: number;
}
