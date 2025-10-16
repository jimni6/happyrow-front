import type {
  Contribution,
  ContributionCreationRequest,
  ContributionUpdateRequest,
} from './Contribution';

export interface ContributionRepository {
  getContributionsByEvent(eventId: number): Promise<Contribution[]>;
  createContribution(data: ContributionCreationRequest): Promise<Contribution>;
  updateContribution(
    id: number,
    data: ContributionUpdateRequest
  ): Promise<Contribution>;
  deleteContribution(id: number): Promise<void>;
}
