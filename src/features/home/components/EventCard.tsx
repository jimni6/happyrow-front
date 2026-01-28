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
              <svg
                width="24"
                height="24"
                viewBox="0 0 33 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24.5334 4.375C25.9793 4.375 27.366 4.98958 28.3884 6.08354C29.4109 7.17751 29.9853 8.66124 29.9853 10.2083V21.875C29.9853 23.4221 29.4109 24.9058 28.3884 25.9998C27.366 27.0938 25.9793 27.7083 24.5334 27.7083H18.0948L11.6043 31.8748C11.4088 32.0003 11.1871 32.0714 10.9593 32.0814C10.7316 32.0915 10.5051 32.0403 10.3006 31.9325C10.0961 31.8247 9.92014 31.6638 9.78883 31.4644C9.65752 31.265 9.57505 31.0336 9.54896 30.7913L9.54078 30.625V27.7083H8.17781C6.77908 27.7083 5.43385 27.1331 4.42037 26.1017C3.4069 25.0702 2.8027 23.6614 2.73277 22.1667L2.72595 21.875V10.2083C2.72595 8.66124 3.30034 7.17751 4.32277 6.08354C5.34519 4.98958 6.73189 4.375 8.17781 4.375H24.5334ZM19.0815 17.5H10.9037C10.5423 17.5 10.1956 17.6536 9.93998 17.9271C9.68438 18.2006 9.54078 18.5716 9.54078 18.9583C9.54078 19.3451 9.68438 19.716 9.93998 19.9895C10.1956 20.263 10.5423 20.4167 10.9037 20.4167H19.0815C19.443 20.4167 19.7897 20.263 20.0453 19.9895C20.3009 19.716 20.4445 19.3451 20.4445 18.9583C20.4445 18.5716 20.3009 18.2006 20.0453 17.9271C19.7897 17.6536 19.443 17.5 19.0815 17.5ZM21.8075 11.6667H10.9037C10.5423 11.6667 10.1956 11.8203 9.93998 12.0938C9.68438 12.3673 9.54078 12.7382 9.54078 13.125C9.54078 13.5118 9.68438 13.8827 9.93998 14.1562C10.1956 14.4297 10.5423 14.5833 10.9037 14.5833H21.8075C22.1689 14.5833 22.5156 14.4297 22.7712 14.1562C23.0268 13.8827 23.1704 13.5118 23.1704 13.125C23.1704 12.7382 23.0268 12.3673 22.7712 12.0938C22.5156 11.8203 22.1689 11.6667 21.8075 11.6667Z"
                  fill="currentColor"
                />
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
                width="24"
                height="24"
                viewBox="0 0 33 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.8963 14.5833H6.81482"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.81482 8.75H25.8963"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.0815 20.4167H6.81482"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.81482 26.25H14.9926"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M24.5333 21.875V30.625"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.4445 26.25H28.6223"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
                width="24"
                height="24"
                viewBox="0 0 33 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.9037 10.2083C10.9037 11.7554 11.4781 13.2392 12.5005 14.3331C13.5229 15.4271 14.9096 16.0417 16.3555 16.0417C17.8015 16.0417 19.1882 15.4271 20.2106 14.3331C21.233 13.2392 21.8074 11.7554 21.8074 10.2083C21.8074 8.66124 21.233 7.17751 20.2106 6.08354C19.1882 4.98958 17.8015 4.375 16.3555 4.375C14.9096 4.375 13.5229 4.98958 12.5005 6.08354C11.4781 7.17751 10.9037 8.66124 10.9037 10.2083Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.8075 27.7083H29.9853"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.8964 23.3333V32.0833"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.17773 30.625V27.7083C8.17773 26.1612 8.75213 24.6775 9.77455 23.5835C10.797 22.4896 12.1837 21.875 13.6296 21.875H19.0815"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
