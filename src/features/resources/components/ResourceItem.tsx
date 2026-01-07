import React, { useState } from 'react';
import type { Resource } from '../types/Resource';
import './ResourceItem.css';

interface ResourceItemProps {
  resource: Resource;
  currentUserId: string;
  onAddContribution: (resourceId: string, quantity: number) => Promise<void>;
  onDeleteContribution: (resourceId: string) => Promise<void>;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  currentUserId,
  onAddContribution,
  onDeleteContribution,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const progressPercentage = resource.suggestedQuantity
    ? Math.min(
        (resource.currentQuantity / resource.suggestedQuantity) * 100,
        100
      )
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
          {resource.currentQuantity}
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
        {resource.contributors.length === 0 ? (
          <p className="no-contributions">No contributions yet</p>
        ) : (
          resource.contributors.map((contributor, index) => (
            <div
              key={`${contributor.userId}-${index}`}
              className="contribution-item"
            >
              <span className="contribution-user">
                {contributor.userId === currentUserId ? 'You' : 'Someone'}
              </span>
              <span className="contribution-quantity">
                {contributor.quantity}
              </span>
              {contributor.userId === currentUserId && (
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
