import type { Contribution } from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

export interface GetContributionsInput {
  eventId: string;
}

export class GetContributions {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: GetContributionsInput): Promise<Contribution[]> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    try {
      return await this.contributionRepository.getContributionsByEvent(
        input.eventId
      );
    } catch (error) {
      throw new Error(
        `Failed to get contributions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
