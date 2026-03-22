import React, { useState } from 'react';
import type { UserRegistration } from '../types/User';
import './RegisterModal.css';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSubmit: (data: UserRegistration) => void;
  onGoogleSignIn?: () => void;
  loading: boolean;
  error: string | null;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSwitchToLogin,
  onSubmit,
  onGoogleSignIn,
  loading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    firstname?: string;
    lastname?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Firstname validation
    if (!firstname) {
      newErrors.firstname = 'First name is required';
    } else if (firstname.length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }

    // Lastname validation
    if (!lastname) {
      newErrors.lastname = 'Last name is required';
    } else if (lastname.length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        email,
        firstname,
        lastname,
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
          <h2 className="auth-title">Register</h2>
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
                <svg className="auth-google-icon" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
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
              <input
                id="firstname"
                type="text"
                className={`auth-input ${errors.firstname ? 'error' : ''}`}
                placeholder="first name"
                value={firstname}
                onChange={e => setFirstname(e.target.value)}
                disabled={loading}
              />
              {errors.firstname && (
                <span className="auth-field-error">{errors.firstname}</span>
              )}
            </div>

            <div className="auth-form-group">
              <input
                id="lastname"
                type="text"
                className={`auth-input ${errors.lastname ? 'error' : ''}`}
                placeholder="last name"
                value={lastname}
                onChange={e => setLastname(e.target.value)}
                disabled={loading}
              />
              {errors.lastname && (
                <span className="auth-field-error">{errors.lastname}</span>
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

            <div className="auth-form-group">
              <div className="auth-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  🔒
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-field-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <div className="auth-switch-link">
              <span>Already have account? </span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
