import React from 'react';
import './HomeScreen.css';
import type { User } from '../../domain/User';

interface HomeScreenProps {
  user: User;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const currentTime = new Date();
  const hour = currentTime.getHours();

  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="greeting-section">
          <h1 className="greeting">
            {getGreeting()}, {user.firstname}! 👋
          </h1>
          <p className="date">{formatDate(currentTime)}</p>
        </div>
        <div className="user-info-card">
          <div className="user-avatar">
            {user.firstname.charAt(0).toUpperCase()}
            {user.lastname.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>
              {user.firstname} {user.lastname}
            </h3>
            <p>{user.email}</p>
            <span
              className={`status ${user.emailConfirmed ? 'verified' : 'unverified'}`}
            >
              {user.emailConfirmed ? '✅ Verified' : '⚠️ Unverified'}
            </span>
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="welcome-card">
          <h2>Welcome to HappyRow! 🎉</h2>
          <p>
            You're successfully logged in and ready to explore all the features
            we have to offer. This is your personal dashboard where you can
            manage your account and access various tools.
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Dashboard</h3>
            <p>View your activity and statistics</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Manage your account preferences</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Projects</h3>
            <p>Create and manage your projects</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Team</h3>
            <p>Collaborate with your team members</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button primary">
              <span>🚀</span>
              Get Started
            </button>
            <button className="action-button secondary">
              <span>📚</span>
              View Documentation
            </button>
            <button className="action-button secondary">
              <span>💬</span>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
