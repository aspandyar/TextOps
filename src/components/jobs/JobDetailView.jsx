import React, { memo } from 'react';
import JobProgress from './JobProgress';
import JobMetrics from './JobMetrics';
import StatCard from '../common/StatCard';
import { formatDate, formatBytes } from '../../utils/formatters';
import '../../pages/JobDetailPage.css';

/**
 * Presentational: job detail UI. Receives job and callbacks; no Redux, no routing.
 */
const JobDetailView = memo(({ job, jobId, onBack }) => {
  return (
    <div className="job-detail-page">
      <div className="job-detail-content">
        <button onClick={onBack} type="button" className="back-button">
          ← Back to Dashboard
        </button>

        <div className="job-detail-header">
          <h1>Job Details</h1>
          <span className={`job-status-badge job-status-${job.status}`}>
            {job.status}
          </span>
        </div>

        <div className="job-detail-stats">
          <StatCard
            title="File Name"
            value={job.fileName}
            subtitle={job.fileSize ? formatBytes(job.fileSize) : ''}
            color="primary"
          />
          <StatCard
            title="Job Type"
            value={job.type}
            subtitle="Processing type"
            color="info"
          />
          <StatCard
            title="Created"
            value={formatDate(job.createdAt)}
            subtitle="Job creation time"
            color="info"
          />
          <StatCard
            title="Progress"
            value={`${job.progress || 0}%`}
            subtitle={job.status}
            color={job.status === 'completed' ? 'success' : 'primary'}
          />
        </div>

        {job.status === 'running' && (
          <div className="job-detail-progress">
            <JobProgress jobId={jobId} />
          </div>
        )}

        <div className="job-detail-metrics">
          <JobMetrics jobId={jobId} />
        </div>
      </div>
    </div>
  );
});

JobDetailView.displayName = 'JobDetailView';

export default JobDetailView;
