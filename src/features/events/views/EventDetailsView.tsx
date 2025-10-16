import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import type { Event } from '../types';
import type { Contribution } from '@/features/contributions/types';
import { ContributionType } from '@/features/contributions/types';
import { ContributionList } from '@/features/contributions/components';
import { HttpContributionRepository } from '@/features/contributions/services';
import {
  AddContribution,
  DeleteContribution,
  GetContributions,
} from '@/features/contributions/use-cases';
import './EventDetailsView.css';

interface EventDetailsViewProps {
  event: Event;
  onBack: () => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event,
  onBack,
}) => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contributionRepository = new HttpContributionRepository();
  const getContributionsUseCase = new GetContributions(contributionRepository);
  const addContributionUseCase = new AddContribution(contributionRepository);
  const deleteContributionUseCase = new DeleteContribution(
    contributionRepository
  );

  useEffect(() => {
    loadContributions();
  }, [event.id]);

  const loadContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContributionsUseCase.execute({ eventId: event.id });
      setContributions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load contributions'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (
    name: string,
    quantity: number,
    type: ContributionType
  ) => {
    if (!user) return;

    try {
      const newContribution = await addContributionUseCase.execute({
        eventId: event.id,
        userId: user.id,
        name,
        quantity,
        type,
      });
      setContributions(prev => [...prev, newContribution]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contribution'
      );
    }
  };

  const handleIncrementContribution = async (id: number) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution) return;

    try {
      // Optimistic update
      setContributions(prev =>
        prev.map(c => (c.id === id ? { ...c, quantity: c.quantity + 1 } : c))
      );
      // In a real app, you'd call an update API here
    } catch (err) {
      setError('Failed to update contribution');
      console.error('Error updating contribution:', err);
      loadContributions(); // Reload on error
    }
  };

  const handleDecrementContribution = async (id: number) => {
    const contribution = contributions.find(c => c.id === id);
    if (!contribution) return;

    try {
      // Optimistic update
      setContributions(prev =>
        prev.map(c => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c))
      );
      // In a real app, you'd call an update API here
    } catch (err) {
      setError('Failed to update contribution');
      console.error('Error updating contribution:', err);
      loadContributions(); // Reload on error
    }
  };

  const handleDeleteContribution = async (id: number) => {
    try {
      await deleteContributionUseCase.execute({ id });
      setContributions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete contribution'
      );
    }
  };

  const foodContributions = contributions.filter(
    c => c.type === ContributionType.FOOD
  );
  const drinkContributions = contributions.filter(
    c => c.type === ContributionType.DRINK
  );

  const participantCount = new Set(contributions.map(c => c.userId)).size;

  return (
    <div className="event-details-view">
      <div className="event-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ←
        </button>
        <h1 className="event-name">{event.name}</h1>
      </div>

      <div className="event-info-bar">
        <div className="info-item">
          <span className="info-icon">👥</span>
          <span className="info-text">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">{event.location}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading contributions...</div>
      ) : (
        <div className="contributions-container">
          <ContributionList
            title="Food"
            contributions={foodContributions}
            type={ContributionType.FOOD}
            onAdd={handleAddContribution}
            onIncrement={handleIncrementContribution}
            onDecrement={handleDecrementContribution}
            onDelete={handleDeleteContribution}
          />

          <ContributionList
            title="Drinks"
            contributions={drinkContributions}
            type={ContributionType.DRINK}
            onAdd={handleAddContribution}
            onIncrement={handleIncrementContribution}
            onDecrement={handleDecrementContribution}
            onDelete={handleDeleteContribution}
          />
        </div>
      )}
    </div>
  );
};
