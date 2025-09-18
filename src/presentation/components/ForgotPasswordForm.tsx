import React, { useState } from 'react';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onBackToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(email);
      setSubmitted(true);
    } catch {
      // Error is handled by the parent component
    }
  };

  if (submitted) {
    return (
      <div className="auth-form">
        <h2>Check Your Email</h2>
        <p>
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p>
          Please check your email and follow the instructions to reset your
          password.
        </p>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="submit-button"
          >
            Back to Sign In
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      <p>
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter your email"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="auth-links">
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="link-button"
            disabled={loading}
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
