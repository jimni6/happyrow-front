import React, { useState } from 'react';
import type { UserRegistration } from '../types/User';

interface RegisterFormProps {
  onSubmit: (userData: UserRegistration) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<UserRegistration>({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    confirmPassword: '',
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your first name"
            minLength={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Last Name</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your last name"
            minLength={2}
          />
        </div>

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
            placeholder="Enter your password (min 8 characters)"
            minLength={8}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Confirm your password"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-links">
        {onSwitchToLogin && (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="link-button"
              disabled={loading}
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
