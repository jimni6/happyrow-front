import React, { useState } from 'react';
import type { Resource } from '../types/Resource';
import './ResourceItem.css';

interface ResourceItemProps {
  resource: Resource;
  currentUserId: string;
  onAddContribution: (resourceId: string, quantity: number) => Promise<void>;
  onUpdateContribution: (resourceId: string, quantity: number) => Promise<void>;
  onDeleteContribution: (resourceId: string) => Promise<void>;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  currentUserId,
  onAddContribution,
  onUpdateContribution,
  onDeleteContribution,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Find user's current contribution
  const userContribution = resource.contributors.find(
    c => c.userId === currentUserId
  );
  const userQuantity = userContribution?.quantity || 0;
  const hasSelection = selectedQuantity !== 0;

  const handleIncrement = () => {
    setSelectedQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    // Allow decrement only if there's a pending selection or if user has a contribution
    if (selectedQuantity > 0) {
      // Decrement the temporary selection
      setSelectedQuantity(prev => prev - 1);
    } else if (userQuantity > 0) {
      // Start negative selection to reduce existing contribution
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const handleValidate = async () => {
    try {
      setIsSaving(true);

      const newQuantity = userQuantity + selectedQuantity;

      if (newQuantity <= 0) {
        // Delete contribution if new quantity is 0 or negative
        await onDeleteContribution(resource.id);
      } else if (userQuantity === 0) {
        // No existing contribution, add new one
        await onAddContribution(resource.id, selectedQuantity);
      } else {
        // Update existing contribution
        await onUpdateContribution(resource.id, newQuantity);
      }

      // Reset selection after successful operation
      setSelectedQuantity(0);
    } catch (error) {
      console.error('Error updating contribution:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="resource-item-card">
      <div className="resource-item-content">
        <div className="resource-item-header">
          <span className="resource-item-name">{resource.name}</span>
          {userQuantity > 0 && (
            <span className="resource-user-contribution">
              Your contribution: {userQuantity}
            </span>
          )}
        </div>
        <div className="resource-item-controls">
          <span className="resource-item-quantity">
            {resource.currentQuantity}
            {resource.suggestedQuantity && `/${resource.suggestedQuantity}`}
          </span>
          <div className="resource-item-buttons">
            <button
              className="resource-btn resource-btn-minus"
              onClick={handleDecrement}
              disabled={
                (selectedQuantity === 0 && userQuantity === 0) || isSaving
              }
              aria-label="Decrease quantity"
            >
              −
            </button>
            {hasSelection && (
              <span
                className={`resource-selected-quantity ${selectedQuantity < 0 ? 'negative' : ''}`}
              >
                {selectedQuantity > 0 ? '+' : ''}
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
