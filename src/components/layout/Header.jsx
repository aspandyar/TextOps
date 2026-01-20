import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../../hooks/useWebSocket';
import './Header.css';

const Header = memo(() => {
  const { isConnected } = useWebSocket();
  const jobsStats = useSelector(state => {
    const jobs = state.jobs.list;
    return {
      total: jobs.length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
    };
  });

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">TextOps Dashboard</h1>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="header-right">
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-label">Total Jobs</span>
              <span className="stat-value">{jobsStats.total}</span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Running</span>
              <span className="stat-value stat-running">{jobsStats.running}</span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value stat-completed">{jobsStats.completed}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
