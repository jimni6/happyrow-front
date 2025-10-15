import type { AuthRepository, UserCredentials, AuthSession } from '../types';

/**
 * Sign In User Use Case
 * Handles user authentication business logic
 */
export class SignInUser {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: UserCredentials): Promise<AuthSession> {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }

    try {
      return await this.authRepository.signIn(credentials);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Sign in failed: ${error.message}`);
      }
      throw new Error('Sign in failed: Unknown error');
    }
  }
}
