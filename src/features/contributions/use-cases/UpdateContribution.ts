import type {
  Contribution,
  ContributionUpdateRequest,
} from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

export interface UpdateContributionInput {
  eventId: string;
  resourceId: string;
  quantity: number;
}

export class UpdateContribution {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: UpdateContributionInput): Promise<Contribution> {
    this.validateInput(input);

    const updateRequest: ContributionUpdateRequest = {
      quantity: input.quantity,
    };

    try {
      return await this.contributionRepository.updateContribution({
        eventId: input.eventId,
        resourceId: input.resourceId,
        data: updateRequest,
      });
    } catch (error) {
      throw new Error(
        `Failed to update contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateInput(input: UpdateContributionInput): void {
    if (!input.quantity || input.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.resourceId || input.resourceId.trim().length === 0) {
      throw new Error('Valid resource ID is required');
    }
  }
}
