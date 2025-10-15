import React from 'react';
import type { User } from '@/features/auth/types';
import type { AuthRepository } from '@/features/auth/types';
import { useAuthActions } from '@/features/auth/hooks';
import './AppHeader.css';

interface AppHeaderProps {
  user: User;
  authRepository: AuthRepository;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  authRepository,
}) => {
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
