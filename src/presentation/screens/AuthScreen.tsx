import React, { useState } from 'react';
import type { AuthRepository } from '../../domain/AuthRepository';
import type { UserRegistration } from '../../domain/User';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useAuthActions } from '../hooks/useAuthActions';
import { ConnectionButton } from '../components/ConnectionButton';
import { CheckConnection } from '../../application/checkConnection';
import { ConnectionApiRepository } from '../../infrastructure/ConnectionApiRepository';
import { apiConfig } from '../../config/api';

interface AuthScreenProps {
  authRepository: AuthRepository;
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ authRepository }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const authActions = useAuthActions({ authRepository });

  // Connection test setup
  const repo = new ConnectionApiRepository(apiConfig.baseUrl);
  const checkConnection = new CheckConnection(repo);

  const handleLoginSuccess = () => {
    // Navigation will be handled by the auth context state change
    console.log('Login successful');
  };

  const handleRegisterSuccess = () => {
    // After successful registration, switch to login
    setMode('login');
    console.log('Registration successful, please sign in');
  };

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      await authActions.signIn.execute(credentials);
      handleLoginSuccess();
    } catch (error) {
      // Error is handled by the useAuthActions hook
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (userData: UserRegistration) => {
    try {
      await authActions.register.execute(userData);
      handleRegisterSuccess();
    } catch (error) {
      // Error is handled by the useAuthActions hook
      console.error('Registration failed:', error);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await authActions.resetPassword.execute(email);
    } catch (error) {
      // Error is handled by the useAuthActions hook
      console.error('Password reset failed:', error);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        {/* Connection Test Button - Available without authentication */}
        <div className="connection-test-section">
          <ConnectionButton useCase={checkConnection} />
          <p className="connection-test-note">
            Test API connection (no auth required)
          </p>
        </div>

        {mode === 'login' && (
          <LoginForm
            onSubmit={handleLogin}
            loading={authActions.signIn.loading}
            error={authActions.signIn.error}
            onForgotPassword={() => setMode('forgot-password')}
            onSwitchToRegister={() => setMode('register')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onSubmit={handleRegister}
            loading={authActions.register.loading}
            error={authActions.register.error}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            loading={authActions.resetPassword.loading}
            error={authActions.resetPassword.error}
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
