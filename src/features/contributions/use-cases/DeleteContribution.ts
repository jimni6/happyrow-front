import type { ContributionRepository } from '../types/ContributionRepository';

export interface DeleteContributionInput {
  id: number;
}

export class DeleteContribution {
  constructor(private contributionRepository: ContributionRepository) {}

  async execute(input: DeleteContributionInput): Promise<void> {
    if (!input.id || input.id < 1) {
      throw new Error('Valid contribution ID is required');
    }

    try {
      await this.contributionRepository.deleteContribution(input.id);
    } catch (error) {
      throw new Error(
        `Failed to delete contribution: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
