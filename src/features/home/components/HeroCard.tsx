import React from 'react';
import type { Event } from '@/features/events';
import './HeroCard.css';

interface HeroCardProps {
  event: Event;
  participantCount: number;
  onClick: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  event,
  participantCount,
  onClick,
}) => {
  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString('fr-FR', { weekday: 'short' });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' });
  const time = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="hero-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="hero-card__label">Prochain event</div>
      <h2 className="hero-card__title">{event.name}</h2>
      <div className="hero-card__meta">
        <span className="hero-card__meta-item">📍 {event.location}</span>
        <span className="hero-card__meta-item">
          🕐 {dayName} {day} {month}, {time}
        </span>
      </div>
      <div className="hero-card__stats">
        <div className="hero-card__stat">
          <div className="hero-card__stat-val">{participantCount}</div>
          <div className="hero-card__stat-label">Confirmés</div>
        </div>
        <div className="hero-card__stat">
          <div className="hero-card__stat-val">{event.type}</div>
          <div className="hero-card__stat-label">Type</div>
        </div>
      </div>
    </div>
  );
};
