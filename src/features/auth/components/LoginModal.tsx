import React, { useState } from 'react';
import { isValidEmail } from '@/shared/utils/validation';
import { GoogleIcon } from '@/shared/components/icons';
import type { UserCredentials } from '../types/User';
import './LoginModal.css';

const CLOSE_ANIMATION_MS = 400;

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSubmit: (credentials: UserCredentials) => void;
  onGoogleSignIn?: () => void;
  loading: boolean;
  error: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToRegister,
  onSubmit,
  onGoogleSignIn,
  loading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        email,
        password,
      });
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, CLOSE_ANIMATION_MS);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`auth-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`auth-modal-content ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="auth-modal-header">
          <p className="auth-greeting">Hello...</p>
          <h2 className="auth-title">Login</h2>
        </div>

        <div className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {onGoogleSignIn && (
            <>
              <button
                type="button"
                className="auth-google-btn"
                onClick={onGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon className="auth-google-icon" />
                Continue with Google
              </button>
              <div className="auth-divider">
                <span>or</span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">
                email
              </label>
              <input
                id="email"
                type="email"
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="info@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
              {errors.email && (
                <span className="auth-field-error">{errors.email}</span>
              )}
            </div>

            <div className="auth-form-group">
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  🔒
                </button>
              </div>
              {errors.password && (
                <span className="auth-field-error">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="auth-switch-link">
              <span>Don't have account? </span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
