import React, { useState } from 'react';
import type { UserRegistration } from '../types/User';
import './RegisterModal.css';

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onSubmit: (data: UserRegistration) => void;
  loading: boolean;
  error: string | null;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSwitchToLogin,
  onSubmit,
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

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

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
              <span className="auth-field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
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
  );
};
