import React from 'react';
import './ProgressRing.css';

interface ProgressRingProps {
  current: number;
  suggested: number;
}

const RADIUS = 12.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ProgressRing: React.FC<ProgressRingProps> = ({
  current,
  suggested,
}) => {
  const ratio = Math.min(current / suggested, 1);
  const offset = CIRCUMFERENCE * (1 - ratio);
  const isComplete = ratio >= 1;
  const colorClass = isComplete ? 'ring-complete' : 'ring-partial';

  return (
    <div className="progress-ring-wrap">
      <svg className="progress-ring-svg" viewBox="0 0 32 32" aria-hidden="true">
        <circle className="progress-ring-bg" cx="16" cy="16" r={RADIUS} />
        <circle
          className={`progress-ring-fg ${colorClass}`}
          cx="16"
          cy="16"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="progress-ring-text">
        {current}/{suggested}
      </span>
    </div>
  );
};
