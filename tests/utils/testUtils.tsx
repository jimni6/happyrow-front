import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../../src/presentation/contexts/AuthContext';
import type { AuthRepository } from '../../src/domain/AuthRepository';
import type {
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
} from '../../src/domain/User';

/**
 * Mock AuthRepository for testing
 */
export class MockAuthRepository implements AuthRepository {
  private mockUser: User | null = null;
  private mockSession: AuthSession | null = null;
  private shouldThrowError = false;

  setMockUser(user: User | null) {
    this.mockUser = user;
  }

  setMockSession(session: AuthSession | null) {
    this.mockSession = session;
  }

  setShouldThrowError(shouldThrow: boolean) {
    this.shouldThrowError = shouldThrow;
  }

  async register(userData: UserRegistration): Promise<User> {
    if (this.shouldThrowError) {
      throw new Error('Registration failed');
    }
    const user: User = {
      id: 'test-user-id',
      email: userData.email,
      emailConfirmed: false,
      firstname: userData.firstname,
      lastname: userData.lastname,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: userData.metadata,
    };
    this.mockUser = user;
    return user;
  }

  async signIn(credentials: UserCredentials): Promise<AuthSession> {
    if (this.shouldThrowError) {
      throw new Error('Sign in failed');
    }
    const user: User = {
      id: 'test-user-id',
      email: credentials.email,
      emailConfirmed: true,
      firstname: 'Test',
      lastname: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const session: AuthSession = {
      user,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    };
    this.mockUser = user;
    this.mockSession = session;
    return session;
  }

  async signOut(): Promise<void> {
    if (this.shouldThrowError) {
      throw new Error('Sign out failed');
    }
    this.mockUser = null;
    this.mockSession = null;
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.shouldThrowError) {
      throw new Error('Get current user failed');
    }
    return this.mockUser;
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    if (this.shouldThrowError) {
      throw new Error('Get current session failed');
    }
    return this.mockSession;
  }

  async refreshSession(): Promise<AuthSession> {
    if (this.shouldThrowError) {
      throw new Error('Refresh session failed');
    }
    if (!this.mockSession) {
      throw new Error('No session to refresh');
    }
    return this.mockSession;
  }

  async resetPassword(email: string): Promise<void> {
    if (this.shouldThrowError) {
      throw new Error('Reset password failed');
    }
    // Mock implementation - no actual email sent to: ${email}
    void email; // Acknowledge parameter usage
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (this.shouldThrowError) {
      throw new Error('Update password failed');
    }
    // Mock implementation - password length: ${newPassword.length}
    void newPassword; // Acknowledge parameter usage
  }

  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void {
    // Mock implementation - return a no-op unsubscribe function
    void callback; // Acknowledge parameter usage
    return () => {};
  }
}

/**
 * Custom render function that includes AuthProvider
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authRepository?: AuthRepository;
}

export function renderWithAuth(
  ui: ReactElement,
  {
    authRepository = new MockAuthRepository(),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthProvider authRepository={authRepository}>{children}</AuthProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockAuthRepository: authRepository as MockAuthRepository,
  };
}

/**
 * Create mock user data for testing
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  emailConfirmed: true,
  firstname: 'Test',
  lastname: 'User',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  metadata: {},
  ...overrides,
});

/**
 * Create mock session data for testing
 */
export const createMockSession = (
  userOverrides: Partial<User> = {}
): AuthSession => ({
  user: createMockUser(userOverrides),
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: new Date(Date.now() + 3600000),
});

/**
 * Create mock user credentials for testing
 */
export const createMockCredentials = (
  overrides: Partial<UserCredentials> = {}
): UserCredentials => ({
  email: 'test@example.com',
  password: 'password123',
  ...overrides,
});

/**
 * Create mock user registration data for testing
 */
export const createMockRegistration = (
  overrides: Partial<UserRegistration> = {}
): UserRegistration => ({
  email: 'test@example.com',
  password: 'password123',
  firstname: 'Test',
  lastname: 'User',
  confirmPassword: 'password123',
  metadata: {},
  ...overrides,
});
