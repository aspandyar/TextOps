import React, { memo } from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick }) => {
  return (
    <div 
      className={`stat-card stat-card-${color} ${onClick ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-content">
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default memo(StatCard);
