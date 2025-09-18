import React, { useState } from 'react';
import type { UserCredentials } from '../../domain/User';

interface LoginFormProps {
  onSubmit: (credentials: UserCredentials) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onForgotPassword?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  onForgotPassword,
  onSwitchToRegister,
}) => {
  const [formData, setFormData] = useState<UserCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="auth-form">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-links">
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="link-button"
            disabled={loading}
          >
            Forgot Password?
          </button>
        )}
        {onSwitchToRegister && (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="link-button"
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
