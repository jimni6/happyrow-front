import React, { useState } from 'react';
import { ParticipantStatus } from '../types/Participant';
import './AddParticipantForm.css';

interface AddParticipantFormProps {
  onSubmit: (userId: string, status: ParticipantStatus) => Promise<void>;
  onCancel: () => void;
}

export const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState<ParticipantStatus>(
    ParticipantStatus.INVITED
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId.trim()) {
      setError('User ID is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(userId.trim(), status);
      setUserId('');
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
        <label htmlFor="userId">User ID</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Enter user ID"
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
