import React from 'react';
import './WelcomeView.css';

interface WelcomeViewProps {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onCreateAccount,
  onLogin,
}) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Logo Section */}
        <div className="logo-section">
          <img src="/logo.svg" alt="Happy Row Logo" className="welcome-logo" />
          <h1 className="brand-name">HAPPY ROW</h1>
          <p className="tagline">Plan Together, Celebrate Better.</p>
        </div>

        {/* Actions Section */}
        <div className="actions-section">
          <button className="btn-create-account" onClick={onCreateAccount}>
            Create Account
          </button>
          <button className="btn-login" onClick={onLogin}>
            Login
          </button>
        </div>

        {/* Footer */}
        <footer className="welcome-footer">All Right Reserved @2026</footer>
      </div>
    </div>
  );
};
