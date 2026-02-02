import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import './AddParticipantModal.css';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(email.trim());
      // Success - reset form and close
      setEmail('');
      setError(null);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add participant'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Participant"
      size="small"
      closeOnOverlayClick={!isSubmitting}
    >
      <form className="add-participant-modal-form" onSubmit={handleSubmit}>
        {error && <div className="add-participant-modal-error">{error}</div>}

        <div className="add-participant-modal-field">
          <label
            htmlFor="participant-email"
            className="add-participant-modal-label"
          >
            Participant Email
          </label>
          <input
            id="participant-email"
            type="email"
            className="add-participant-modal-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter participant's email"
            disabled={isSubmitting}
            required
            autoFocus
          />
        </div>

        <div className="add-participant-modal-actions">
          <button
            type="button"
            className="add-participant-modal-btn add-participant-modal-btn--cancel"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-participant-modal-btn add-participant-modal-btn--submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Participant'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
