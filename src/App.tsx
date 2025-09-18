import React from 'react';
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import { AuthScreen } from './presentation/screens/AuthScreen';
import { HomeScreen } from './presentation/screens/HomeScreen';
import { AuthServiceFactory } from './infrastructure/AuthServiceFactory';
import type { AuthRepository } from './domain/AuthRepository';
import type { User } from './domain/User';
import { useAuthActions } from './presentation/hooks/useAuthActions';
import './presentation/styles/Auth.css';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

let authRepository: AuthRepository | null = null;
try {
  authRepository = AuthServiceFactory.getAuthRepository();
} catch (error) {
  console.error('Failed to initialize auth repository:', error);
}

// App Header Component
interface AppHeaderProps {
  user: User;
  authRepository: AuthRepository;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, authRepository }) => {
  const authActions = useAuthActions({ authRepository });

  const handleSignOut = async () => {
    try {
      await authActions.signOut.execute();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <h2>HappyRow</h2>
        </div>
        <div className="header-user">
          <span className="user-greeting">
            {user.firstname} {user.lastname}
          </span>
          <button
            onClick={handleSignOut}
            disabled={authActions.signOut.loading}
            className="sign-out-button"
          >
            {authActions.signOut.loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  );
};

const AppContent: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen authRepository={authRepository!} />;
  }

  return (
    <div className="app">
      <AppHeader user={user!} authRepository={authRepository!} />
      <HomeScreen user={user!} />
    </div>
  );
};

export default function App() {
  if (!authRepository) {
    return (
      <ErrorBoundary>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Configuration Error</h2>
          <p>
            Please configure your Supabase environment variables to use the
            application.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider authRepository={authRepository}>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
