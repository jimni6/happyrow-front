import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User, AuthSession } from '../../domain/User';
import type { AuthRepository } from '../../domain/AuthRepository';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
            console.log('Session expired, attempting refresh...');
            try {
              const refreshedSession = await authRepository.refreshSession();
              setSession(refreshedSession);
              setUser(refreshedSession.user);
            } catch (refreshError) {
              console.error('Session refresh failed:', refreshError);
              // Clear expired session
              setSession(null);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // If session is invalid (403 error), clear it
        if (
          error instanceof Error &&
          error.message.includes('session_not_found')
        ) {
          console.log('Invalid session detected, clearing auth state');
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
