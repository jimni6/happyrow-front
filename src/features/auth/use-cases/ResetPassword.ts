import type { AuthRepository } from '../types/AuthRepository';
import { isValidEmail } from '@/shared/utils/validation';

/**
 * Reset Password Use Case
 * Handles password reset business logic
 */
export class ResetPassword {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string): Promise<void> {
    // Validate input
    if (!email) {
      throw new Error('Email is required');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      await this.authRepository.resetPassword(email);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }
      throw new Error('Password reset failed: Unknown error');
    }
  }
}
