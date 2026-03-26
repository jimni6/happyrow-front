import React from 'react';
import type { Event } from '@/features/events';
import './TimelineEvent.css';

interface TimelineEventProps {
  event: Event;
  participantCount: number;
  isFar?: boolean;
  onClick: () => void;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  participantCount,
  isFar = false,
  onClick,
}) => {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate
    .toLocaleDateString('fr-FR', { month: 'short' })
    .toUpperCase();
  const time = eventDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="timeline-event"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div
        className={`timeline-event__dot ${isFar ? 'timeline-event__dot--muted' : ''}`}
      />
      <div className="timeline-event__date">
        <div className="timeline-event__day">{day}</div>
        <div className="timeline-event__month">{month}</div>
      </div>
      <div className="timeline-event__card">
        <div className="timeline-event__title">{event.name}</div>
        <div className="timeline-event__info">
          <span>
            {time} &bull; {event.location}
          </span>
          {participantCount > 0 && (
            <span className="timeline-event__count">
              {participantCount} participant{participantCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
