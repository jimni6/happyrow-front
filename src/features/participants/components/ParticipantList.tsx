import React, { useState, useRef, useEffect } from 'react';
import type { Participant, ParticipantStatus } from '../types/Participant';
import './ParticipantList.css';

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
  onRemove?: (userId: string) => void;
  onUpdateStatus?: (userId: string, status: ParticipantStatus) => void;
}

const STATUS_OPTIONS: {
  value: ParticipantStatus;
  icon: string;
  label: string;
}[] = [
  { value: 'CONFIRMED' as ParticipantStatus, icon: '✓', label: 'Confirmed' },
  { value: 'MAYBE' as ParticipantStatus, icon: '?', label: 'Maybe' },
  { value: 'DECLINED' as ParticipantStatus, icon: '✗', label: 'Declined' },
];

const AVATAR_COLORS = ['primary', 'secondary', 'accent'] as const;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  onRemove,
  onUpdateStatus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const isCurrentUser = (userId: string) => userId === currentUserId;

  const getDisplayName = (participant: Participant) => {
    if (isCurrentUser(participant.userId)) return 'You';
    if (participant.userName) return participant.userName;
    return participant.userId.substring(0, 8);
  };

  const handleStatusSelect = (userId: string, status: ParticipantStatus) => {
    onUpdateStatus?.(userId, status);
    setOpenDropdown(null);
  };

  const statusOrder: Record<string, number> = {
    CONFIRMED: 0,
    MAYBE: 1,
    DECLINED: 2,
    INVITED: 3,
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
  });

  if (sortedParticipants.length === 0) {
    return (
      <div className="participant-list-empty">
        <p>No participants yet</p>
      </div>
    );
  }

  const visibleStackCount = Math.min(sortedParticipants.length, 5);
  const remainingCount = sortedParticipants.length - visibleStackCount;

  return (
    <div className="participant-list">
      {/* Avatar stack (collapsed view) */}
      <button
        className="participant-stack-row"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={
          expanded ? 'Collapse participant list' : 'Expand participant list'
        }
      >
        <div className="participant-avatar-stack">
          {sortedParticipants.slice(0, visibleStackCount).map((p, i) => (
            <div
              key={p.userId || `stack-${i}`}
              className={`participant-stack-avatar participant-avatar--${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              title={getDisplayName(p)}
            >
              {getInitials(getDisplayName(p))}
            </div>
          ))}
          {remainingCount > 0 && (
            <span className="participant-stack-more">+{remainingCount}</span>
          )}
        </div>
        <span
          className={`participant-stack-chevron${expanded ? ' expanded' : ''}`}
        >
          ›
        </span>
      </button>

      {/* Expanded list */}
      <div
        className={`participant-expand-container${expanded ? ' expanded' : ''}`}
      >
        <div className="participant-expand-list">
          {sortedParticipants.map((participant, index) => (
            <div
              key={
                participant.userId || participant.id || `participant-${index}`
              }
              className={`participant-item${
                isCurrentUser(participant.userId)
                  ? ' participant-item-current'
                  : ''
              }`}
            >
              <div className="participant-info">
                <div
                  className={`participant-avatar-sm participant-avatar--${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                >
                  {getInitials(getDisplayName(participant))}
                </div>
                <span
                  className={`participant-id${
                    isCurrentUser(participant.userId)
                      ? ' participant-id-current'
                      : ''
                  }`}
                >
                  {getDisplayName(participant)}
                </span>
                {isCurrentUser(participant.userId) &&
                participant.status !== 'INVITED' &&
                onUpdateStatus ? (
                  <div
                    className="status-dropdown-wrapper"
                    ref={
                      openDropdown === participant.userId ? dropdownRef : null
                    }
                  >
                    <button
                      className={`participant-status status-clickable ${getStatusClass(participant.status)}`}
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === participant.userId
                            ? null
                            : participant.userId
                        )
                      }
                      aria-label="Change your status"
                    >
                      {getStatusIcon(participant.status)} ✎
                    </button>
                    {openDropdown === participant.userId && (
                      <div className="status-dropdown">
                        {STATUS_OPTIONS.filter(
                          opt => opt.value !== participant.status
                        ).map(opt => (
                          <button
                            key={opt.value}
                            className={`status-dropdown-item ${getStatusClass(opt.value)}`}
                            onClick={() =>
                              handleStatusSelect(participant.userId, opt.value)
                            }
                          >
                            {opt.icon} {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span
                    className={`participant-status ${getStatusClass(participant.status)}`}
                  >
                    {getStatusIcon(participant.status)}
                  </span>
                )}
              </div>
              {isCurrentUser(participant.userId) &&
                participant.status === 'INVITED' &&
                onUpdateStatus && (
                  <div className="participant-actions">
                    <button
                      className="status-btn status-btn-confirm"
                      onClick={() =>
                        handleStatusSelect(
                          participant.userId,
                          'CONFIRMED' as ParticipantStatus
                        )
                      }
                      aria-label="Confirm participation"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      className="status-btn status-btn-decline"
                      onClick={() =>
                        handleStatusSelect(
                          participant.userId,
                          'DECLINED' as ParticipantStatus
                        )
                      }
                      aria-label="Decline invitation"
                    >
                      ✗ Decline
                    </button>
                  </div>
                )}
              {!isCurrentUser(participant.userId) && onRemove && (
                <button
                  className="remove-btn"
                  onClick={() => onRemove(participant.userId)}
                  aria-label="Remove participant"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
