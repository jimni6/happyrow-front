import React, { useState } from 'react';
import type { Resource } from '../types/Resource';
import type { Contribution } from '@/features/contributions';
import './ResourceItem.css';

interface ResourceItemProps {
  resource: Resource;
  contributions: Contribution[];
  currentUserId: string;
  onAddContribution: (resourceId: string, quantity: number) => Promise<void>;
  onDeleteContribution: (resourceId: string) => Promise<void>;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  contributions,
  currentUserId,
  onAddContribution,
  onDeleteContribution,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const totalQuantity = contributions.reduce((sum, c) => sum + c.quantity, 0);
  const progressPercentage = resource.suggestedQuantity
    ? Math.min((totalQuantity / resource.suggestedQuantity) * 100, 100)
    : 0;

  const handleAdd = async () => {
    if (quantity < 1) return;

    try {
      await onAddContribution(resource.id, quantity);
      setQuantity(1);
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteContribution(resource.id);
    } catch (error) {
      console.error('Error deleting contribution:', error);
    }
  };

  return (
    <div className="resource-item">
      <div className="resource-header">
        <div className="resource-info">
          <span className="resource-icon">
            {resource.category === 'FOOD' ? '🍕' : '🥤'}
          </span>
          <h3 className="resource-name">{resource.name}</h3>
          <span className="resource-category">{resource.category}</span>
        </div>
        <div className="resource-quantity">
          {totalQuantity}
          {resource.suggestedQuantity && ` / ${resource.suggestedQuantity}`}
        </div>
      </div>

      {resource.suggestedQuantity && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      <div className="contributions-list">
        {contributions.length === 0 ? (
          <p className="no-contributions">No contributions yet</p>
        ) : (
          contributions.map(contribution => (
            <div key={contribution.id} className="contribution-item">
              <span className="contribution-user">
                {contribution.userId === currentUserId ? 'You' : 'Someone'}
              </span>
              <span className="contribution-quantity">
                {contribution.quantity}
              </span>
              {contribution.userId === currentUserId && (
                <button
                  className="delete-contribution-btn"
                  onClick={handleDelete}
                  aria-label="Delete contribution"
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="resource-actions">
        {!isAdding ? (
          <button
            className="add-contribution-btn"
            onClick={() => setIsAdding(true)}
          >
            + Add Contribution
          </button>
        ) : (
          <div className="add-contribution-form">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="quantity-input"
              placeholder="Quantity"
            />
            <button className="submit-btn" onClick={handleAdd}>
              Add
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setIsAdding(false);
                setQuantity(1);
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
