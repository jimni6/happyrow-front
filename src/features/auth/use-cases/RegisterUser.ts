import type { AuthRepository, User, UserRegistration } from '../types';

/**
 * Register User Use Case
 * Handles user registration business logic
 */
export class RegisterUser {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(userData: UserRegistration): Promise<User> {
    // Validate input
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    if (!userData.firstname || !userData.lastname) {
      throw new Error('First name and last name are required');
    }

    if (userData.firstname.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }

    if (userData.lastname.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }

    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    ) {
      throw new Error('Passwords do not match');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    try {
      return await this.authRepository.register(userData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Unknown error');
    }
  }
}
