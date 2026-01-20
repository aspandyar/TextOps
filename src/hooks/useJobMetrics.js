import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeToJobMetrics, unsubscribeFromJobMetrics } from '../services/websocket';
import { updateJobProgress } from '../store/slices/jobsSlice';
import { updateJobMetrics as updateMetrics } from '../store/slices/metricsSlice';

export const useJobMetrics = (jobId) => {
  const dispatch = useDispatch();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!jobId || subscribedRef.current) return;

    const handleMetrics = (data) => {
      if (data.progress !== undefined) {
        dispatch(updateJobProgress({
          jobId,
          progress: data.progress,
          status: data.status,
        }));
      }

      if (data.metrics) {
        dispatch(updateMetrics({
          jobId,
          metrics: data.metrics,
        }));
      }
    };

    subscribeToJobMetrics(jobId, handleMetrics);
    subscribedRef.current = true;

    return () => {
      unsubscribeFromJobMetrics(jobId);
      subscribedRef.current = false;
    };
  }, [jobId, dispatch]);

  return null;
};
