import React from 'react';
import type { Resource } from '@/features/resources';
import {
  ResourceCategory,
  ResourceItem,
  InlineAddResourceForm,
} from '@/features/resources';

interface ResourceCategorySectionProps {
  title: string;
  category: ResourceCategory;
  resources: Resource[];
  currentUserId: string;
  onAddContribution: (resourceId: string, quantity: number) => Promise<void>;
  onUpdateContribution: (resourceId: string, quantity: number) => Promise<void>;
  onDeleteContribution: (resourceId: string) => Promise<void>;
  onAddResource: (data: {
    name: string;
    category: ResourceCategory;
    quantity: number;
    suggestedQuantity?: number;
  }) => Promise<void>;
}

export const ResourceCategorySection: React.FC<
  ResourceCategorySectionProps
> = ({
  title,
  category,
  resources,
  currentUserId,
  onAddContribution,
  onUpdateContribution,
  onDeleteContribution,
  onAddResource,
}) => {
  return (
    <div className="category-section">
      <h2 className="category-title">{title}</h2>
      <div className="resources-list">
        {resources.map(resource => (
          <ResourceItem
            key={resource.id}
            resource={resource}
            currentUserId={currentUserId}
            onAddContribution={onAddContribution}
            onUpdateContribution={onUpdateContribution}
            onDeleteContribution={onDeleteContribution}
          />
        ))}
      </div>
      <InlineAddResourceForm category={category} onSubmit={onAddResource} />
    </div>
  );
};
