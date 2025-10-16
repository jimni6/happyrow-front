import type {
  Contribution,
  ContributionCreationRequest,
  ContributionType,
} from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

export interface AddContributionInput {
  eventId: string;
  userId: string;
  name: string;
  quantity: number;
  type: ContributionType;
}

export class AddContribution {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: AddContributionInput): Promise<Contribution> {
    // Validate input
    this.validateInput(input);

    // Convert to API request format
    const contributionRequest: ContributionCreationRequest = {
      eventId: input.eventId,
      userId: input.userId,
      name: input.name.trim(),
      quantity: input.quantity,
      type: input.type,
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
    if (!input.name || input.name.trim().length < 2) {
      throw new Error('Contribution name must be at least 2 characters long');
    }

    if (!input.quantity || input.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (!input.type) {
      throw new Error('Contribution type is required');
    }

    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Valid user ID is required');
    }

    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }
  }
}
