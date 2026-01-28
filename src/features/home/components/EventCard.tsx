import React from 'react';
import './EventCard.css';
import type { Event } from '@/features/events';

interface EventCardProps {
  event: Event;
  participantCount: number;
  onClick?: () => void;
  onToggle?: (checked: boolean) => void;
  showToggle?: boolean;
  showActions?: boolean;
  onConfirm?: () => void;
  onMaybe?: () => void;
  onDecline?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  participantCount,
  onClick,
  onToggle,
  showToggle = false,
  showActions = false,
  onConfirm,
  onMaybe,
  onDecline,
}) => {
  const eventDate = new Date(event.date);
  const monthName = eventDate.toLocaleDateString('en-US', { month: 'long' });
  const day = eventDate.getDate();
  const time = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Determine card background color based on date
  const cardColorClass =
    day % 2 === 0 ? 'event-card--coral' : 'event-card--teal';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if (
      (e.target as HTMLElement).closest('.event-card__actions') ||
      (e.target as HTMLElement).closest('.event-card__toggle')
    ) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      className={`event-card ${cardColorClass}`}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="event-card__date-section">
        <span className="event-card__month">{monthName}</span>
        <span className="event-card__day">{day}</span>
        <span className="event-card__time">{time}</span>
      </div>

      <div className="event-card__content">
        <h3 className="event-card__title">{event.name}</h3>

        <div className="event-card__info">
          <div className="event-card__info-item">
            <svg
              className="event-card__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{participantCount} Participants</span>
          </div>

          <div className="event-card__info-item">
            <svg
              className="event-card__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="event-card__footer">
          <div className="event-card__action-icons">
            <button
              className="event-card__action-btn"
              aria-label="Message"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            <button
              className="event-card__action-btn"
              aria-label="Resources"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>

            <button
              className="event-card__action-btn"
              aria-label="Add participant"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </button>
          </div>

          {showToggle && (
            <label
              className="event-card__toggle"
              onClick={e => e.stopPropagation()}
            >
              <input
                type="checkbox"
                onChange={e => onToggle?.(e.target.checked)}
                onClick={e => e.stopPropagation()}
              />
              <span className="event-card__toggle-slider"></span>
            </label>
          )}

          {showActions && (
            <div
              className="event-card__actions"
              onClick={e => e.stopPropagation()}
            >
              <span className="event-card__actions-label">Do you join?</span>
              <button
                className="event-card__response-btn event-card__response-btn--confirm"
                onClick={onConfirm}
                aria-label="Confirm"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                className="event-card__response-btn event-card__response-btn--maybe"
                onClick={onMaybe}
                aria-label="Maybe"
              >
                <span>?</span>
              </button>
              <button
                className="event-card__response-btn event-card__response-btn--decline"
                onClick={onDecline}
                aria-label="Decline"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
