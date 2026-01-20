import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeAlert } from '../../store/slices/alertsSlice';
import './Alert.css';

const Alert = memo(({ alert }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeAlert(alert.id));
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert.id, dispatch]);

  const handleClose = () => {
    dispatch(removeAlert(alert.id));
  };

  return (
    <div className={`alert alert-${alert.type}`}>
      <span className="alert-message">{alert.message}</span>
      <button onClick={handleClose} className="alert-close">×</button>
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;
