import React from 'react';
import type { User } from '../../domain/User';
import type { AuthRepository } from '../../domain/AuthRepository';
import { useAuthActions } from '../hooks/useAuthActions';

interface UserProfileProps {
  user: User;
  authRepository: AuthRepository;
}

export const UserProfile: React.FC<UserProfileProps> = ({
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
    <div className="user-profile">
      <div className="user-info">
        <h3>Welcome back!</h3>
        <p>{user.email}</p>
        <p className="user-status">
          {user.emailConfirmed ? '✅ Email verified' : '⚠️ Email not verified'}
        </p>
      </div>
      <button
        onClick={handleSignOut}
        disabled={authActions.signOut.loading}
        className="logout-button"
      >
        {authActions.signOut.loading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
};
