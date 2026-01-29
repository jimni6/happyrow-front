import React, { useState } from 'react';
import type { ResourceCategory } from '../types/Resource';
import './InlineAddResourceForm.css';

interface InlineAddResourceFormProps {
  category: ResourceCategory;
  onSubmit: (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => Promise<void>;
}

export const InlineAddResourceForm: React.FC<InlineAddResourceFormProps> = ({
  category,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [suggestedQuantity, setSuggestedQuantity] = useState(1);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = name.trim().length > 0;

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim().length > 0 && error) {
      setError(null);
    }
  };

  const handleIncrement = () => {
    setSelectedQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (selectedQuantity > 0) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (selectedQuantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        name: name.trim(),
        category,
        quantity: selectedQuantity,
        suggestedQuantity: suggestedQuantity,
      });
      // Reset form on success
      setName('');
      setSuggestedQuantity(1);
      setSelectedQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inline-add-form-container">
      <div className="inline-add-main-card">
        <input
          type="text"
          className="inline-add-name-input"
          placeholder="Add new +"
          value={name}
          onChange={e => handleNameChange(e.target.value)}
          disabled={isSubmitting}
        />
        <div className={`inline-add-controls ${isActive ? 'active' : ''}`}>
          <input
            type="number"
            className="inline-add-suggested-input"
            min="1"
            value={suggestedQuantity}
            onChange={e =>
              setSuggestedQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            disabled={!isActive || isSubmitting}
          />
          <div className="inline-add-quantity-buttons">
            <button
              className="inline-quantity-btn inline-quantity-btn-minus"
              onClick={handleDecrement}
              disabled={!isActive || selectedQuantity === 0 || isSubmitting}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="inline-quantity-display">{selectedQuantity}</span>
            <button
              className="inline-quantity-btn inline-quantity-btn-plus"
              onClick={handleIncrement}
              disabled={!isActive || isSubmitting}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
      {error && <div className="inline-add-error">{error}</div>}
      {isActive && (
        <div className="inline-add-actions">
          <button
            className="inline-add-validate"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Validate'}
          </button>
        </div>
      )}
    </div>
  );
};
