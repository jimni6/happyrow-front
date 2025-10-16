import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAuthRepository } from '@/features/auth';
import type { UserCredentials, UserRegistration } from '@/features/auth';

// Types for Supabase auth state change callback
type AuthChangeEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY';
type MockSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    user_metadata: Record<string, unknown>;
  };
} | null;

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

// Mock the Supabase createClient function
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('SupabaseAuthRepository', () => {
  let repository: SupabaseAuthRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseAuthRepository('test-url', 'test-key');
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const userData: UserRegistration = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User',
        metadata: { additionalInfo: 'test' },
      };

      const mockSupabaseUser = {
        id: 'user-id',
        email: 'test@example.com',
        email_confirmed_at: null,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        user_metadata: {
          firstname: 'Test',
          lastname: 'User',
          additionalInfo: 'test',
        },
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockSupabaseUser },
        error: null,
      });

      const result = await repository.register(userData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstname: userData.firstname,
            lastname: userData.lastname,
            ...userData.metadata,
          },
        },
      });

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        emailConfirmed: false,
        firstname: 'Test',
        lastname: 'User',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        metadata: {
          firstname: 'Test',
          lastname: 'User',
          additionalInfo: 'test',
        },
      });
    });

    it('should throw error when registration fails', async () => {
      const userData: UserRegistration = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Registration failed' },
      });

      await expect(repository.register(userData)).rejects.toThrow(
        'Registration failed: Registration failed'
      );
    });

    it('should throw error when no user data returned', async () => {
      const userData: UserRegistration = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User',
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(repository.register(userData)).rejects.toThrow(
        'Registration failed: No user data returned'
      );
    });

    it('should handle undefined timestamps gracefully', async () => {
      const userData: UserRegistration = {
        email: 'test@example.com',
        password: 'password123',
        firstname: 'Test',
        lastname: 'User',
      };

      const mockSupabaseUser = {
        id: 'user-id',
        email: 'test@example.com',
        email_confirmed_at: null,
        created_at: undefined,
        updated_at: undefined,
        user_metadata: {},
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockSupabaseUser },
        error: null,
      });

      const result = await repository.register(userData);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSupabaseUser = {
        id: 'user-id',
        email: 'test@example.com',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        user_metadata: { firstname: 'Test', lastname: 'User' },
      };

      const mockSupabaseSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: mockSupabaseUser,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSupabaseSession, user: mockSupabaseUser },
        error: null,
      });

      const result = await repository.signIn(credentials);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
      });

      expect(result).toEqual({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          emailConfirmed: true,
          firstname: 'Test',
          lastname: 'User',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z'),
          metadata: { firstname: 'Test', lastname: 'User' },
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: expect.any(Date),
      });
    });

    it('should throw error when sign in fails', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(repository.signIn(credentials)).rejects.toThrow(
        'Sign in failed: Invalid credentials'
      );
    });

    it('should handle undefined expires_at gracefully', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockSupabaseUser = {
        id: 'user-id',
        email: 'test@example.com',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        user_metadata: {},
      };

      const mockSupabaseSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: undefined,
        user: mockSupabaseUser,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSupabaseSession, user: mockSupabaseUser },
        error: null,
      });

      const result = await repository.signIn(credentials);

      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      await expect(repository.signOut()).resolves.not.toThrow();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      await expect(repository.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockSupabaseUser = {
        id: 'user-id',
        email: 'test@example.com',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        user_metadata: { firstname: 'Test', lastname: 'User' },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockSupabaseUser },
        error: null,
      });

      const result = await repository.getCurrentUser();

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        emailConfirmed: true,
        firstname: 'Test',
        lastname: 'User',
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        metadata: { firstname: 'Test', lastname: 'User' },
      });
    });

    it('should return null when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await repository.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should throw error when getting user fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Failed to get user' },
      });

      await expect(repository.getCurrentUser()).rejects.toThrow(
        'Failed to get user'
      );
    });
  });

  describe('resetPassword', () => {
    it('should successfully send reset password email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      await expect(
        repository.resetPassword('test@example.com')
      ).resolves.not.toThrow();

      expect(
        mockSupabaseClient.auth.resetPasswordForEmail
      ).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    });

    it('should throw error when reset password fails', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Reset password failed' },
      });

      await expect(
        repository.resetPassword('test@example.com')
      ).rejects.toThrow('Reset password failed');
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const unsubscribe = repository.onAuthStateChange(mockCallback);

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should call callback with mapped session when session exists', () => {
      const mockCallback = vi.fn();
      let authStateCallback: (
        event: AuthChangeEvent,
        session: MockSession
      ) => void;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation(callback => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      repository.onAuthStateChange(mockCallback);

      const mockSession = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: {
          id: 'user-id',
          email: 'test@example.com',
          email_confirmed_at: '2023-01-01T00:00:00.000Z',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          user_metadata: {},
        },
      };

      authStateCallback!('SIGNED_IN', mockSession);

      expect(mockCallback).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: 'user-id',
          email: 'test@example.com',
        }),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: expect.any(Date),
      });
    });

    it('should call callback with null when session is null', () => {
      const mockCallback = vi.fn();
      let authStateCallback: (
        event: AuthChangeEvent,
        session: MockSession
      ) => void;

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation(callback => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      });

      repository.onAuthStateChange(mockCallback);

      authStateCallback!('SIGNED_OUT', null);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });
});
