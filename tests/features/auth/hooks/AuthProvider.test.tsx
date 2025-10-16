import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/features/auth';
import {
  MockAuthRepository,
  createMockSession,
  createMockUser,
} from '../../../utils/testUtils';
import type { AuthSession } from '@/features/auth';

// Test component that uses the useAuth hook
const TestComponent: React.FC = () => {
  const { user, session, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <div>
      <div data-testid="authenticated">
        {isAuthenticated ? 'true' : 'false'}
      </div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="session-token">
        {session?.accessToken || 'No session'}
      </div>
    </div>
  );
};

describe('AuthContext', () => {
  let mockAuthRepository: MockAuthRepository;

  beforeEach(() => {
    mockAuthRepository = new MockAuthRepository();
    vi.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide initial loading state', () => {
      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should provide unauthenticated state when no session', async () => {
      mockAuthRepository.setMockSession(null);

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('session-token')).toHaveTextContent(
        'No session'
      );
    });

    it('should provide authenticated state when session exists', async () => {
      const mockUser = createMockUser({ email: 'test@example.com' });
      const mockSession = createMockSession({ email: 'test@example.com' });

      mockAuthRepository.setMockSession(mockSession);
      mockAuthRepository.setMockUser(mockUser);

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'test@example.com'
      );
      expect(screen.getByTestId('session-token')).toHaveTextContent(
        'mock-access-token'
      );
    });

    it('should handle auth repository errors gracefully', async () => {
      mockAuthRepository.setShouldThrowError(true);

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    });

    it('should set up auth state change listener', () => {
      const onAuthStateChangeSpy = vi.spyOn(
        mockAuthRepository,
        'onAuthStateChange'
      );

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      expect(onAuthStateChangeSpy).toHaveBeenCalled();
    });

    it('should update state when auth state changes', async () => {
      let authStateCallback: (session: AuthSession | null) => void;

      vi.spyOn(mockAuthRepository, 'onAuthStateChange').mockImplementation(
        callback => {
          authStateCallback = callback;
          return () => {}; // unsubscribe function
        }
      );

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Initially unauthenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

      // Simulate auth state change to authenticated
      const mockSession = createMockSession({ email: 'new@example.com' });
      authStateCallback!(mockSession);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent(
          'new@example.com'
        );
      });

      // Simulate auth state change to unauthenticated
      authStateCallback!(null);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });

    it('should cleanup auth state listener on unmount', () => {
      const unsubscribeMock = vi.fn();
      vi.spyOn(mockAuthRepository, 'onAuthStateChange').mockReturnValue(
        unsubscribeMock
      );

      const { unmount } = render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should return correct context values', async () => {
      const mockUser = createMockUser({
        email: 'context@example.com',
        emailConfirmed: true,
      });
      const mockSession = createMockSession({ email: 'context@example.com' });

      mockAuthRepository.setMockSession(mockSession);
      mockAuthRepository.setMockUser(mockUser);

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'context@example.com'
      );
      expect(screen.getByTestId('session-token')).toHaveTextContent(
        'mock-access-token'
      );
    });

    it('should update when context state changes', async () => {
      let authStateCallback: (session: AuthSession | null) => void;

      vi.spyOn(mockAuthRepository, 'onAuthStateChange').mockImplementation(
        callback => {
          authStateCallback = callback;
          return () => {};
        }
      );

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      // Test multiple state changes
      const sessions = [
        createMockSession({ email: 'user1@example.com' }),
        createMockSession({ email: 'user2@example.com' }),
        null,
      ];

      for (const session of sessions) {
        authStateCallback!(session);

        await waitFor(() => {
          if (session) {
            expect(screen.getByTestId('authenticated')).toHaveTextContent(
              'true'
            );
            expect(screen.getByTestId('user-email')).toHaveTextContent(
              session.user.email
            );
          } else {
            expect(screen.getByTestId('authenticated')).toHaveTextContent(
              'false'
            );
            expect(screen.getByTestId('user-email')).toHaveTextContent(
              'No user'
            );
          }
        });
      }
    });
  });

  describe('Authentication flow integration', () => {
    it('should handle complete authentication lifecycle', async () => {
      let authStateCallback: (session: AuthSession | null) => void;

      vi.spyOn(mockAuthRepository, 'onAuthStateChange').mockImplementation(
        callback => {
          authStateCallback = callback;
          return () => {};
        }
      );

      render(
        <AuthProvider authRepository={mockAuthRepository}>
          <TestComponent />
        </AuthProvider>
      );

      // 1. Initial loading state
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // 2. Wait for initial load (no session)
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');

      // 3. User signs in
      const signInSession = createMockSession({ email: 'signin@example.com' });
      authStateCallback!(signInSession);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent(
          'signin@example.com'
        );
      });

      // 4. User signs out
      authStateCallback!(null);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });
  });
});
