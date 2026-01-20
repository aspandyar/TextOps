import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Alert from './Alert';
import './AlertContainer.css';

const AlertContainer = memo(() => {
  const alerts = useSelector(state => state.alerts.items);

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <Alert key={alert.id} alert={alert} />
      ))}
    </div>
  );
});

AlertContainer.displayName = 'AlertContainer';

export default AlertContainer;
