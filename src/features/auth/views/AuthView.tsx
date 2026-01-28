import React, { useState } from 'react';
import type { UserRegistration } from '../types/User';
import type { AuthRepository } from '../types/AuthRepository';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { useAuthActions } from '../hooks/useAuthActions';
import './AuthView.css';

interface AuthViewProps {
  authRepository: AuthRepository;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthView: React.FC<AuthViewProps> = ({
  authRepository,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const authActions = useAuthActions({ authRepository });

  const handleLoginSuccess = () => {
    console.log('Login successful');
  };

  const handleRegisterSuccess = () => {
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
      console.error('Login failed:', error);
    }
  };

  const handleRegister = async (userData: UserRegistration) => {
    try {
      await authActions.register.execute(userData);
      handleRegisterSuccess();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await authActions.resetPassword.execute(email);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
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
