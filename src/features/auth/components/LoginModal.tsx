import React, { useState } from 'react';
import type { UserCredentials } from '../types/User';
import './LoginModal.css';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSubmit: (credentials: UserCredentials) => void;
  loading: boolean;
  error: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToRegister,
  onSubmit,
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    }, 400); // Match animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`login-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`login-modal-content ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="login-modal-header">
          <p className="login-greeting">Hello...</p>
          <h2 className="login-title">Login</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              email
            </label>
            <input
              id="email"
              type="email"
              className={`login-input ${errors.email ? 'error' : ''}`}
              placeholder="info@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            {errors.email && (
              <span className="login-field-error">{errors.email}</span>
            )}
          </div>

          <div className="login-form-group">
            <div className="login-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`login-input ${errors.password ? 'error' : ''}`}
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                🔒
              </button>
            </div>
            {errors.password && (
              <span className="login-field-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="login-register-link">
            <span>Don't have account? </span>
            <button
              type="button"
              className="login-link-btn"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
