import React from 'react';
import type { ResourceCategory } from '@/features/resources';
import './MyContributionsList.css';

export interface MyContribution {
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  quantity: number;
}

interface MyContributionsListProps {
  contributions: MyContribution[];
}

const CATEGORY_ICONS: Record<string, string> = {
  FOOD: '🍕',
  DRINK: '🥤',
  UTENSIL: '🍴',
  DECORATION: '🎉',
  OTHER: '📦',
};

export const MyContributionsList: React.FC<MyContributionsListProps> = ({
  contributions,
}) => {
  if (contributions.length === 0) {
    return (
      <div className="my-contributions-section">
        <h2 className="my-contributions-title">
          <span className="meta-icon">🎁</span> My Contributions
        </h2>
        <p className="my-contributions-empty">
          You haven't contributed to any resource yet.
        </p>
      </div>
    );
  }

  return (
    <div className="my-contributions-section">
      <h2 className="my-contributions-title">
        <span className="meta-icon">🎁</span> My Contributions
      </h2>
      <div className="my-contributions-list">
        {contributions.map((c, index) => (
          <div
            key={c.resourceId || `contrib-${index}`}
            className="my-contribution-item"
          >
            <span className="my-contribution-icon">
              {CATEGORY_ICONS[c.category] || '📦'}
            </span>
            <span className="my-contribution-name">{c.resourceName}</span>
            <span className="my-contribution-quantity">x{c.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
