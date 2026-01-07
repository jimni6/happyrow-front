export interface Contribution {
  id: string;
  eventId: string;
  resourceId: string;
  userId: string;
  quantity: number;
  createdAt: Date;
}

export interface ContributionCreationRequest {
  eventId: string;
  resourceId: string;
  userId: string;
  quantity: number;
}

export interface ContributionUpdateRequest {
  quantity?: number;
}
