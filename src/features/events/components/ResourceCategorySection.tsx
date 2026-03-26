import React, { useState } from 'react';
import type { Resource } from '@/features/resources';
import {
  ResourceCategory,
  ResourceItem,
  AddResourceModal,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="category-section">
      <div className="category-section-header">
        <h2 className="category-title">{title}</h2>
        <button
          className="category-add-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add
        </button>
      </div>
      <div className="resources-list">
        {resources.map((resource, index) => (
          <ResourceItem
            key={resource.id || `resource-${index}`}
            resource={resource}
            currentUserId={currentUserId}
            onAddContribution={onAddContribution}
            onUpdateContribution={onUpdateContribution}
            onDeleteContribution={onDeleteContribution}
          />
        ))}
      </div>
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category={category}
        onSubmit={onAddResource}
      />
    </div>
  );
};
