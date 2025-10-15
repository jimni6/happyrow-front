import React from 'react';
import { AuthProvider, useAuth } from '@/features/auth/hooks';
import { AuthView } from '@/features/auth/views';
import { HomeView } from '@/features/home/views';
import { AuthServiceFactory } from '@/features/auth/services';
import type { AuthRepository } from '@/features/auth/types';
import { AppLayout } from '@/layouts';
import '@/core/styles/index.css';

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

// Initialize auth repository
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
    return <AuthView authRepository={authRepository!} />;
  }

  return (
    <AppLayout user={user!} authRepository={authRepository!}>
      <HomeView user={user!} />
    </AppLayout>
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
