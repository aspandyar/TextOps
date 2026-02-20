import React, { memo, useState, useEffect, useCallback } from 'react';
import JobProgress from './JobProgress';
import JobMetrics from './JobMetrics';
import StatCard from '../common/StatCard';
import { formatDate, formatBytes } from '../../utils/formatters';
import { jobService } from '../../services/jobService';
import '../../pages/JobDetailPage.css';

/**
 * Presentational: job detail UI. Receives job and callbacks; no Redux, no routing.
 * onClose: optional, when provided shows Close instead of Back (for modal).
 */
const JobDetailView = memo(({ job, jobId, onBack, onClose }) => {
  const [outputText, setOutputText] = useState(null);
  const [outputState, setOutputState] = useState('idle'); // idle | loading | loaded | tooLarge | statsOnly | error

  const hasResultFile = job.status === 'completed' && job.result?.resultFileName;

  useEffect(() => {
    if (!hasResultFile) {
      setOutputState(job.status === 'completed' && job.result?.stats ? 'statsOnly' : 'idle');
      return;
    }
    let cancelled = false;
    setOutputState('loading');
    jobService
      .getOutputText(jobId)
      .then((data) => {
        if (cancelled) return;
        if (data.tooLarge) setOutputState('tooLarge');
        else if (data.statsOnly) setOutputState('statsOnly');
        else {
          setOutputText(data.text ?? '');
          setOutputState('loaded');
        }
      })
      .catch(() => {
        if (!cancelled) setOutputState('error');
      });
    return () => { cancelled = true; };
  }, [jobId, hasResultFile, job.status, job.result]);

  const handleDownload = useCallback(() => {
    jobService.downloadResultFile(jobId, job.result?.resultFileName);
  }, [jobId, job.result?.resultFileName]);

  return (
    <div className="job-detail-page">
      <div className="job-detail-content">
        <div className="job-detail-actions">
          {onBack && (
            <button onClick={onBack} type="button" className="back-button">
              ← Back to Dashboard
            </button>
          )}
          {onClose && (
            <button onClick={onClose} type="button" className="back-button">
              Close
            </button>
          )}
        </div>

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

        {job.status === 'completed' && job.result?.stats && (
          <div className="job-detail-result-stats">
            <h3>Result stats</h3>
            <div className="job-result-stats-inline">
              <span>Words: {job.result.stats.words?.toLocaleString() ?? '—'}</span>
              <span>Lines: {job.result.stats.lines?.toLocaleString() ?? '—'}</span>
              <span>Characters: {job.result.stats.characters?.toLocaleString() ?? '—'}</span>
            </div>
          </div>
        )}

        {job.status === 'completed' && hasResultFile && (
          <div className="job-detail-result-section">
            <h3>Result file</h3>
            <button type="button" className="job-detail-download-btn" onClick={handleDownload}>
              Download {job.result.resultFileName}
            </button>
            <h3 className="job-detail-output-title">Full output</h3>
            <div className="job-detail-output-box">
              {outputState === 'loading' && <p>Loading output…</p>}
              {outputState === 'tooLarge' && <p className="output-too-large">Output is too large to display. Use the Download button.</p>}
              {outputState === 'statsOnly' && <p>This job has stats only.</p>}
              {outputState === 'error' && <p>Could not load output.</p>}
              {outputState === 'loaded' && (
                <pre className="job-detail-output-text">{outputText}</pre>
              )}
            </div>
          </div>
        )}

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
