import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const EMPTY_METRICS = [];

export const useJobProgress = (jobId) => {
  const job = useSelector(state =>
    state.jobs.list.find(j => j.id === jobId)
  );
  const metrics = useSelector(state =>
    state.metrics.jobMetrics[jobId] ?? EMPTY_METRICS
  );

  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Simulate progress if job exists but no real metrics (currentProgress already prefers job.progress)
  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return;
    }

    if (job.progress !== undefined && job.progress > 0) {
      return;
    }

    // Simulate for demo purposes when no real progress yet
    const interval = setInterval(() => {
      setSimulatedProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.random() * 5, 100);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [job]);

  const currentProgress = job?.progress ?? simulatedProgress;
  const latestMetrics = metrics[metrics.length - 1] || {};

  return {
    progress: currentProgress,
    status: job?.status || 'pending',
    metrics: {
      linesProcessed: latestMetrics.linesProcessed || 0,
      totalLines: latestMetrics.totalLines || 1000,
      speed: latestMetrics.speed || 0,
      memory: latestMetrics.memory || 0,
      throughput: latestMetrics.throughput || 0,
    },
  };
};
