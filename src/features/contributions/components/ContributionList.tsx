import React, { useState } from 'react';
import type { Contribution, ContributionType } from '../types/Contribution';
import { ContributionItem } from './ContributionItem';
import './ContributionList.css';

interface ContributionListProps {
  title: string;
  contributions: Contribution[];
  type: ContributionType;
  onAdd: (name: string, quantity: number, type: ContributionType) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ContributionList: React.FC<ContributionListProps> = ({
  title,
  contributions,
  type,
  onAdd,
  onIncrement,
  onDecrement,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(newItemName, newItemQuantity, type);
      setNewItemName('');
      setNewItemQuantity(1);
      setIsAdding(false);
    }
  };

  return (
    <div className="contribution-list">
      <h3 className="contribution-list-title">{title}</h3>
      <div className="contribution-list-items">
        {contributions.map(contribution => (
          <ContributionItem
            key={contribution.id}
            contribution={contribution}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onDelete={onDelete}
          />
        ))}
        {isAdding ? (
          <form onSubmit={handleSubmit} className="add-contribution-form">
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="contribution-input"
              autoFocus
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={e => setNewItemQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="contribution-quantity-input"
            />
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewItemName('');
                  setNewItemQuantity(1);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="add-new-btn" onClick={() => setIsAdding(true)}>
            Add new +
          </button>
        )}
      </div>
    </div>
  );
};
