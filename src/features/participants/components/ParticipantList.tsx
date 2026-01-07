import React from 'react';
import type { Participant, ParticipantStatus } from '../types/Participant';
import './ParticipantList.css';

interface ParticipantListProps {
  participants: Participant[];
  currentUserEmail: string;
  onRemove?: (userEmail: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserEmail,
  onRemove,
}) => {
  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return '✓';
      case 'DECLINED':
        return '✗';
      case 'MAYBE':
        return '?';
      case 'INVITED':
        return '📧';
      default:
        return '';
    }
  };

  const getStatusClass = (status: ParticipantStatus) => {
    return `status-${status.toLowerCase()}`;
  };

  if (participants.length === 0) {
    return (
      <div className="participant-list-empty">
        <p>No participants yet</p>
      </div>
    );
  }

  return (
    <div className="participant-list">
      {participants.map(participant => (
        <div key={participant.userEmail} className="participant-item">
          <div className="participant-info">
            <span className="participant-icon">👤</span>
            <span className="participant-id">
              {participant.userEmail === currentUserEmail
                ? 'You'
                : participant.userEmail}
            </span>
            <span
              className={`participant-status ${getStatusClass(participant.status)}`}
            >
              {getStatusIcon(participant.status)} {participant.status}
            </span>
          </div>
          {participant.userEmail !== currentUserEmail && onRemove && (
            <button
              className="remove-btn"
              onClick={() => onRemove(participant.userEmail)}
              aria-label="Remove participant"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
