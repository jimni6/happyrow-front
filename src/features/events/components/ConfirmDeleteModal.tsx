import React from 'react';
import './ConfirmDeleteModal.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  eventName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  eventName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-delete-overlay" onClick={onCancel}>
      <div className="confirm-delete-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-delete-header">
          <h2>⚠️ Delete Event</h2>
        </div>

        <div className="confirm-delete-content">
          <p>
            Are you sure you want to delete <strong>"{eventName}"</strong>?
          </p>
          <p className="confirm-delete-warning">
            This action cannot be undone. All event data will be permanently
            deleted.
          </p>
        </div>

        <div className="confirm-delete-actions">
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="delete-button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
};
