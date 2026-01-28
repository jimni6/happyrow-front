import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/features/auth';
import { AuthView } from '@/features/auth';
import { HomeView } from '@/features/home';
import { WelcomeView } from '@/features/welcome';
import { RegisterModal } from '@/features/auth/components/RegisterModal';
import { AuthServiceFactory } from '@/features/auth';
import type { AuthRepository } from '@/features/auth';
import type { UserRegistration } from '@/features/auth/types/User';
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
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRegister = async (userData: UserRegistration) => {
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      const { RegisterUser } = await import(
        '@/features/auth/use-cases/RegisterUser'
      );
      const registerUseCase = new RegisterUser(authRepository!);
      await registerUseCase.execute(userData);

      // Registration successful, close modal and switch to login
      setShowRegisterModal(false);
      setShowLoginModal(true);
    } catch (error) {
      setRegisterError(
        error instanceof Error ? error.message : 'Registration failed'
      );
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <WelcomeView
          onCreateAccount={() => setShowRegisterModal(true)}
          onLogin={() => setShowLoginModal(true)}
        />

        {showRegisterModal && (
          <RegisterModal
            onClose={() => {
              setShowRegisterModal(false);
              setRegisterError(null);
            }}
            onSwitchToLogin={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
              setRegisterError(null);
            }}
            onSubmit={handleRegister}
            loading={registerLoading}
            error={registerError}
          />
        )}

        {showLoginModal && (
          <AuthView authRepository={authRepository!} initialMode="login" />
        )}
      </>
    );
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
