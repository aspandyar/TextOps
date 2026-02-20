import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import { selectJobsStats } from '../../store/selectors/jobSelectors';
import { logout } from '../../store/slices/authSlice';
import './Header.css';

const Header = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const jobsStats = useSelector(selectJobsStats);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

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
          {user && (
            <div className="header-user">
              <span className="header-user-email">{user.email}</span>
              <span className={`header-user-role role-${user.role}`}>{user.role}</span>
              <button type="button" className="header-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
