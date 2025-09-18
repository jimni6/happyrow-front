import type { AuthRepository } from '../domain/AuthRepository';

/**
 * Sign Out User Use Case
 * Handles user sign out business logic
 */
export class SignOutUser {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }
      throw new Error('Sign out failed: Unknown error');
    }
  }
}
