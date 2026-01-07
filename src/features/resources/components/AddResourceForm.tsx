import React, { useState } from 'react';
import { ResourceCategory } from '../types/Resource';
import './AddResourceForm.css';

interface AddResourceFormProps {
  onSubmit: (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export const AddResourceForm: React.FC<AddResourceFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>(
    ResourceCategory.FOOD
  );
  const [quantity, setQuantity] = useState(0);
  const [suggestedQuantity, setSuggestedQuantity] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Resource name must be at least 2 characters');
      return;
    }

    if (quantity < 0) {
      setError('Initial quantity cannot be negative');
      return;
    }

    if (suggestedQuantity !== '' && suggestedQuantity < 1) {
      setError('Suggested quantity must be at least 1');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        category,
        quantity,
        suggestedQuantity:
          suggestedQuantity === '' ? undefined : suggestedQuantity,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create resource'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-resource-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="resource-name">Resource Name *</label>
        <input
          id="resource-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Pizza, Soda, Plates"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="resource-category">Category *</label>
        <select
          id="resource-category"
          value={category}
          onChange={e => setCategory(e.target.value as ResourceCategory)}
          required
          disabled={isSubmitting}
        >
          <option value={ResourceCategory.FOOD}>🍕 Food</option>
          <option value={ResourceCategory.DRINK}>🥤 Drink</option>
          <option value={ResourceCategory.UTENSIL}>🍴 Utensil</option>
          <option value={ResourceCategory.DECORATION}>🎈 Decoration</option>
          <option value={ResourceCategory.OTHER}>📦 Other</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="initial-quantity">Your Quantity</label>
          <input
            id="initial-quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="suggested-quantity">Suggested Total</label>
          <input
            id="suggested-quantity"
            type="number"
            min="1"
            value={suggestedQuantity}
            onChange={e =>
              setSuggestedQuantity(
                e.target.value === '' ? '' : parseInt(e.target.value) || ''
              )
            }
            placeholder="Optional"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Resource'}
        </button>
      </div>
    </form>
  );
};
