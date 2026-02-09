import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import MetricsChart from '../charts/MetricsChart';
import './JobMetrics.css';

const JobMetrics = memo(({ jobId }) => {
  const metrics = useSelector(state => state.metrics.jobMetrics[jobId] || []);

  if (metrics.length === 0) {
    return (
      <div className="job-metrics-empty">
        <p>No metrics available for this job</p>
      </div>
    );
  }

  const chartData = metrics.map(m => ({
    timestamp: m.timestamp,
    linesProcessed: m.linesProcessed || 0,
    speed: m.speed || 0,
    memory: m.memory || 0,
    throughput: m.throughput || 0,
  }));

  return (
    <div className="job-metrics">
      <h3 className="job-metrics-title">Job Metrics</h3>
      <MetricsChart data={chartData} />
    </div>
  );
});

JobMetrics.displayName = 'JobMetrics';

export default JobMetrics;
