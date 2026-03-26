import React, { useEffect, useState, ReactNode } from 'react';
import type { User, AuthSession } from '../types/User';
import type { AuthRepository } from '../types/AuthRepository';
import { AuthContext, AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
  authRepository: AuthRepository;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authRepository,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        const currentSession = await authRepository.getCurrentSession();
        if (currentSession) {
          // Check if session is expired
          const now = new Date();
          if (currentSession.expiresAt && currentSession.expiresAt > now) {
            setSession(currentSession);
            setUser(currentSession.user);
          } else {
            // Session expired, try to refresh
            try {
              const refreshedSession = await authRepository.refreshSession();
              setSession(refreshedSession);
              setUser(refreshedSession.user);
            } catch {
              // Clear expired session
              setSession(null);
              setUser(null);
            }
          }
        }
      } catch (error) {
        // If session is invalid (403 error), clear it
        if (
          error instanceof Error &&
          error.message.includes('session_not_found')
        ) {
          setSession(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const unsubscribe = authRepository.onAuthStateChange(newSession => {
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authRepository]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
