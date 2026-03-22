import type { AuthRepository } from '../types/AuthRepository';

/**
 * Sign In With Provider Use Case
 * Handles OAuth authentication (e.g. Google) via Supabase
 */
export class SignInWithProvider {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(provider: 'google'): Promise<void> {
    try {
      await this.authRepository.signInWithProvider(provider);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OAuth sign in failed: ${error.message}`);
      }
      throw new Error('OAuth sign in failed: Unknown error');
    }
  }
}
