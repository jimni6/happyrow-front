import type { AuthRepository, User } from '../types';

/**
 * Get Current User Use Case
 * Retrieves the currently authenticated user
 */
export class GetCurrentUser {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<User | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get current user: ${error.message}`);
      }
      throw new Error('Failed to get current user: Unknown error');
    }
  }
}
