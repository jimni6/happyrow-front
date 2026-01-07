import type {
  Contribution,
  ContributionCreationRequest,
  ContributionUpdateRequest,
} from './Contribution';

export interface ContributionRepository {
  getContributionsByResource(params: {
    eventId: string;
    resourceId: string;
  }): Promise<Contribution[]>;
  createContribution(data: ContributionCreationRequest): Promise<Contribution>;
  updateContribution(params: {
    eventId: string;
    resourceId: string;
    data: ContributionUpdateRequest;
  }): Promise<Contribution>;
  deleteContribution(params: {
    eventId: string;
    resourceId: string;
  }): Promise<void>;
}
