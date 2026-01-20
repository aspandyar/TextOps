import React, { memo } from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, label, showPercentage = true, color = 'primary' }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar-bg">
        <div 
          className={`progress-bar-fill progress-bar-${color}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {showPercentage && (
            <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ProgressBar);
