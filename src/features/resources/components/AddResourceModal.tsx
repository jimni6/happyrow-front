import React, { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import type { ResourceCategory } from '../types/Resource';
import './AddResourceModal.css';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ResourceCategory;
  onSubmit: (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => Promise<void>;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [suggestedQuantity, setSuggestedQuantity] = useState(1);
  const [contribution, setContribution] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setSuggestedQuantity(1);
    setContribution(1);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    if (contribution < 1 || contribution > 10000) {
      setError('Quantity must be between 1 and 10,000');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: trimmed,
        category,
        quantity: contribution,
        suggestedQuantity,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add resource"
      size="small"
    >
      <div className="add-resource-modal-form">
        <div className="add-resource-field">
          <label className="add-resource-label" htmlFor="resource-name">
            Name
          </label>
          <input
            id="resource-name"
            type="text"
            className="add-resource-input"
            placeholder="e.g. Quiche lorraine"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className="add-resource-field">
          <label className="add-resource-label">Suggested quantity</label>
          <div className="add-resource-qty-row">
            <div className="add-resource-qty-buttons">
              <button
                type="button"
                className="add-resource-qty-btn"
                onClick={() => setSuggestedQuantity(q => Math.max(1, q - 1))}
                disabled={suggestedQuantity <= 1 || isSubmitting}
                aria-label="Decrease suggested quantity"
              >
                −
              </button>
              <span className="add-resource-qty-value">
                {suggestedQuantity}
              </span>
              <button
                type="button"
                className="add-resource-qty-btn"
                onClick={() =>
                  setSuggestedQuantity(q => Math.min(10000, q + 1))
                }
                disabled={isSubmitting}
                aria-label="Increase suggested quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="add-resource-field">
          <label className="add-resource-label">Your contribution</label>
          <div className="add-resource-qty-row">
            <div className="add-resource-qty-buttons">
              <button
                type="button"
                className="add-resource-qty-btn"
                onClick={() => setContribution(q => Math.max(0, q - 1))}
                disabled={contribution <= 0 || isSubmitting}
                aria-label="Decrease contribution"
              >
                −
              </button>
              <span className="add-resource-qty-value">{contribution}</span>
              <button
                type="button"
                className="add-resource-qty-btn"
                onClick={() => setContribution(q => Math.min(10000, q + 1))}
                disabled={isSubmitting}
                aria-label="Increase contribution"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="add-resource-error" role="alert">
            {error}
          </div>
        )}

        <div className="add-resource-actions">
          <button
            type="button"
            className="add-resource-cancel-btn"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="add-resource-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
