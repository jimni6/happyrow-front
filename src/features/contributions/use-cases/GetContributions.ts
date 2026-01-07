import type { Contribution } from '../types/Contribution';
import type { ContributionRepository } from '../types/ContributionRepository';

export interface GetContributionsInput {
  eventId: string;
  resourceId: string;
}

export class GetContributions {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: GetContributionsInput): Promise<Contribution[]> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.resourceId || input.resourceId.trim().length === 0) {
      throw new Error('Valid resource ID is required');
    }

    try {
      return await this.contributionRepository.getContributionsByResource({
        eventId: input.eventId,
        resourceId: input.resourceId,
      });
    } catch (error) {
      throw new Error(
        `Failed to get contributions: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
