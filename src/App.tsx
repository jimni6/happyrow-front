import React from 'react';
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import { AuthScreen } from './presentation/screens/AuthScreen';
import { HomeScreen } from './presentation/screens/HomeScreen';
import { UserProfile } from './presentation/components/UserProfile';
import { AuthServiceFactory } from './infrastructure/AuthServiceFactory';
import type { AuthRepository } from './domain/AuthRepository';
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
      <UserProfile user={user!} authRepository={authRepository!} />
      <HomeScreen />
    </div>
  );
};

// Simple development mode component (bypasses auth)
const DevMode: React.FC = () => {
  return (
    <div className="app">
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          background: '#fff3cd',
          marginBottom: '20px',
        }}
      >
        <h3>🚧 Development Mode</h3>
        <p>
          Authentication is disabled. Configure Supabase to enable full
          features.
        </p>
      </div>
      <HomeScreen />
    </div>
  );
};

export default function App() {
  // Check if we're in development mode without proper Supabase config
  const isDevelopmentMode =
    !authRepository ||
    (typeof window !== 'undefined' &&
      window.location.search.includes('dev=true'));

  if (isDevelopmentMode) {
    return (
      <ErrorBoundary>
        <DevMode />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider authRepository={authRepository!}>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
