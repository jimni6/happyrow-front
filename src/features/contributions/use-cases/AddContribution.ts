import type {
  Contribution,
  ContributionCreationRequest,
} from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

export interface AddContributionInput {
  eventId: string;
  resourceId: string;
  userId: string;
  quantity: number;
}

export class AddContribution {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: AddContributionInput): Promise<Contribution> {
    // Validate input
    this.validateInput(input);

    // Convert to API request format
    const contributionRequest: ContributionCreationRequest = {
      eventId: input.eventId,
      resourceId: input.resourceId,
      userId: input.userId,
      quantity: input.quantity,
    };
    try {
      return await this.contributionRepository.createContribution(
        contributionRequest
      );
    } catch (error) {
      throw new Error(
        `Failed to add contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private validateInput(input: AddContributionInput): void {
    if (!input.quantity || input.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.resourceId || input.resourceId.trim().length === 0) {
      throw new Error('Valid resource ID is required');
    }
  }
}
