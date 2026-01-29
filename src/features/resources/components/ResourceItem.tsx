import React, { useState } from 'react';
import type { Resource } from '../types/Resource';
import './ResourceItem.css';

interface ResourceItemProps {
  resource: Resource;
  onAddContribution: (resourceId: string, quantity: number) => Promise<void>;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  onAddContribution,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const hasSelection = selectedQuantity > 0;

  const handleIncrement = () => {
    setSelectedQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (selectedQuantity > 0) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const handleValidate = async () => {
    try {
      setIsSaving(true);
      await onAddContribution(resource.id, selectedQuantity);
      // Reset selection after successful contribution
      setSelectedQuantity(0);
    } catch (error) {
      console.error('Error adding contribution:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="resource-item-card">
      <div className="resource-item-content">
        <span className="resource-item-name">{resource.name}</span>
        <div className="resource-item-controls">
          <span className="resource-item-quantity">
            {resource.currentQuantity}
            {resource.suggestedQuantity && `/${resource.suggestedQuantity}`}
          </span>
          <div className="resource-item-buttons">
            <button
              className="resource-btn resource-btn-minus"
              onClick={handleDecrement}
              disabled={selectedQuantity === 0 || isSaving}
              aria-label="Decrease quantity"
            >
              −
            </button>
            {hasSelection && (
              <span className="resource-selected-quantity">
                {selectedQuantity}
              </span>
            )}
            <button
              className="resource-btn resource-btn-plus"
              onClick={handleIncrement}
              disabled={isSaving}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
      {hasSelection && (
        <div className="resource-item-actions">
          <button
            className="resource-validate-btn"
            onClick={handleValidate}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Validate'}
          </button>
        </div>
      )}
    </div>
  );
};
