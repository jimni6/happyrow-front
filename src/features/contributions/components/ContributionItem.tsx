import React from 'react';
import type { Contribution } from '../types';
import './ContributionItem.css';

interface ContributionItemProps {
  contribution: Contribution;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ContributionItem: React.FC<ContributionItemProps> = ({
  contribution,
  onIncrement,
  onDecrement,
  onDelete,
}) => {
  const handleDecrement = () => {
    if (contribution.quantity <= 1) {
      onDelete(contribution.id);
    } else {
      onDecrement(contribution.id);
    }
  };

  return (
    <div className="contribution-item">
      <div className="contribution-name">
        {contribution.name}{' '}
        {contribution.quantity > 1 && `x${contribution.quantity}`}
      </div>
      <div className="contribution-actions">
        <button
          className="contribution-btn decrement"
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <button
          className="contribution-btn increment"
          onClick={() => onIncrement(contribution.id)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
};
