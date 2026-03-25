import React, { useState } from 'react';
import './AddParticipantForm.css';

interface AddParticipantFormProps {
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

export const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('User email is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(email.trim());
      setEmail('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add participant'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-participant-form" onSubmit={handleSubmit}>
      <h3>Add Participant</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="userEmail">User Email</label>
        <input
          id="userEmail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter user email"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Adding...' : 'Add Participant'}
        </button>
      </div>
    </form>
  );
};
