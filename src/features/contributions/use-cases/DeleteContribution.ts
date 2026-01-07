import type { ContributionRepository } from '../types/ContributionRepository';

export interface DeleteContributionInput {
  eventId: string;
  resourceId: string;
}

export class DeleteContribution {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: DeleteContributionInput): Promise<void> {
    if (!input.eventId || input.eventId.trim().length === 0) {
      throw new Error('Valid event ID is required');
    }

    if (!input.resourceId || input.resourceId.trim().length === 0) {
      throw new Error('Valid resource ID is required');
    }

    try {
      await this.contributionRepository.deleteContribution({
        eventId: input.eventId,
        resourceId: input.resourceId,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
