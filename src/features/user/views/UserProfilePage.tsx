import React from 'react';
import { useAuth } from '@/features/auth';
import { useAuthActions } from '@/features/auth';
import { AuthServiceFactory } from '@/features/auth';
import './UserProfilePage.css';

export const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const authRepository = AuthServiceFactory.getAuthRepository();
  const authActions = useAuthActions({ authRepository });

  const handleSignOut = async () => {
    try {
      await authActions.signOut.execute();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-content">
        <div className="user-profile-header">
          <div className="user-avatar">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="user-name">
            {user.firstname} {user.lastname}
          </h1>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="user-profile-section">
          <h2 className="section-title">Profile Settings</h2>
          <p className="coming-soon-message">
            Profile customization coming soon...
          </p>
        </div>

        <div className="user-profile-actions">
          <button
            onClick={handleSignOut}
            disabled={authActions.signOut.loading}
            className="btn-sign-out"
          >
            {authActions.signOut.loading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
