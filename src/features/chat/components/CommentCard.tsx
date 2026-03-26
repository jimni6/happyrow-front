import React from 'react';
import type { ChatMessage } from '../types';
import './CommentCard.css';

interface CommentCardProps {
  message: ChatMessage;
  isOwn: boolean;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f97066, #fb8f87)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  'linear-gradient(135deg, #0ea5e9, #38bdf8)',
  'linear-gradient(135deg, #fb923c, #fdba74)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return time;

  const day = date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return `${day} · ${time}`;
}

export const CommentCard: React.FC<CommentCardProps> = ({ message, isOwn }) => {
  const gradient =
    AVATAR_GRADIENTS[hashCode(message.authorId) % AVATAR_GRADIENTS.length];

  return (
    <article className="comment-card">
      <div className="comment-card__head">
        <div
          className="comment-card__avatar"
          style={{ background: gradient }}
          aria-hidden="true"
        >
          {getInitials(message.authorName)}
        </div>
        <div className="comment-card__meta">
          <div className="comment-card__name-row">
            <span className="comment-card__name">
              {isOwn ? 'Vous' : message.authorName}
            </span>
            <span className="comment-card__time">
              {formatTime(message.createdAt)}
            </span>
          </div>
          <p className="comment-card__text">{message.content}</p>
        </div>
      </div>
    </article>
  );
};
