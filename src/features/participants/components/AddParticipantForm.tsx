import React, { useState } from 'react';
import { ParticipantStatus } from '../types/Participant';
import './AddParticipantForm.css';

interface AddParticipantFormProps {
  onSubmit: (userEmail: string, status: ParticipantStatus) => Promise<void>;
  onCancel: () => void;
}

export const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState<ParticipantStatus>(
    ParticipantStatus.INVITED
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userEmail.trim()) {
      setError('User email is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(userEmail.trim(), status);
      setUserEmail('');
      setStatus(ParticipantStatus.INVITED);
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
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          placeholder="Enter user email"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={e => setStatus(e.target.value as ParticipantStatus)}
          disabled={isSubmitting}
        >
          <option value={ParticipantStatus.INVITED}>Invited</option>
          <option value={ParticipantStatus.CONFIRMED}>Confirmed</option>
          <option value={ParticipantStatus.MAYBE}>Maybe</option>
          <option value={ParticipantStatus.DECLINED}>Declined</option>
        </select>
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
