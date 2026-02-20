import React, { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectJobById } from '../../store/selectors/jobSelectors';
import { useJobProgress } from '../../hooks/useJobProgress';
import ProgressBar from '../common/ProgressBar';
import { formatDuration } from '../../utils/formatters';
import './JobProgress.css';

const JobProgress = memo(({ jobId }) => {
  const job = useSelector((state) => selectJobById(state, jobId));
  const { progress, metrics } = useJobProgress(jobId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!job?.startedAt || job.status !== 'running') return;
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [job?.startedAt, job?.status]);

  if (!job || job.status !== 'running') {
    return null;
  }

  const elapsedTime = job.startedAt
    ? (now - new Date(job.startedAt).getTime()) / 1000
    : 0;

  return (
    <div className="job-progress">
      <ProgressBar progress={progress} label="Processing Progress" />
      
      <div className="job-progress-metrics">
        <div className="job-progress-metric">
          <span className="metric-label">Lines Processed:</span>
          <span className="metric-value">
            {metrics.linesProcessed.toLocaleString()} / {metrics.totalLines.toLocaleString()}
          </span>
        </div>
        
        <div className="job-progress-metric">
          <span className="metric-label">Processing Speed:</span>
          <span className="metric-value">{metrics.speed.toLocaleString()} lines/s</span>
        </div>
        
        <div className="job-progress-metric">
          <span className="metric-label">Elapsed Time:</span>
          <span className="metric-value">{formatDuration(elapsedTime)}</span>
        </div>
        
        {metrics.throughput > 0 && (
          <div className="job-progress-metric">
            <span className="metric-label">Throughput:</span>
            <span className="metric-value">{metrics.throughput.toFixed(2)} MB/s</span>
          </div>
        )}
      </div>
    </div>
  );
});

JobProgress.displayName = 'JobProgress';

export default JobProgress;
