import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setActiveJob } from '../../store/slices/jobsSlice';
import { useJobProgress } from '../../hooks/useJobProgress';
import ProgressBar from '../common/ProgressBar';
import { formatDate, formatBytes } from '../../utils/formatters';
import './JobCard.css';

const JobCard = memo(({ job, onCancel, onDelete, onJobClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { progress, metrics } = useJobProgress(job.id);

  const handleCancel = useCallback((e) => {
    e?.stopPropagation?.();
    onCancel?.(job.id);
  }, [job.id, onCancel]);

  const handleDelete = useCallback((e) => {
    e?.stopPropagation?.();
    onDelete?.(job.id);
  }, [job.id, onDelete]);

  const handleSelect = useCallback(() => {
    dispatch(setActiveJob(job.id));
    if (onJobClick) {
      onJobClick(job.id);
    } else {
      navigate(`/job/${job.id}`);
    }
  }, [dispatch, navigate, job.id, onJobClick]);

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'running': return 'primary';
      case 'cancelled': return 'warning';
      default: return 'info';
    }
  };

  const getJobTypeLabel = () => {
    const types = {
      wordcount: 'Word Count',
      dedup: 'Remove Duplicates',
      clean: 'Clean Trash',
      sort: 'Sort Numbers',
    };
    return types[job.type] || job.type;
  };

  return (
    <div className={`job-card job-card-${getStatusColor()}`} onClick={handleSelect}>
      <div className="job-card-header">
        <div className="job-card-title">
          <h4>{getJobTypeLabel()}</h4>
          <span className={`job-status job-status-${job.status}`}>
            {job.status}
          </span>
        </div>
        <div className="job-card-actions">
          {job.status === 'running' && (
            <button onClick={handleCancel} className="job-action-btn job-action-cancel">
              Cancel
            </button>
          )}
          {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
            <button onClick={handleDelete} className="job-action-btn job-action-delete">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="job-card-body">
        <div className="job-card-info">
          <div className="job-info-item">
            <span className="job-info-label">File:</span>
            <span className="job-info-value">{job.fileName}</span>
          </div>
          {job.fileSize && (
            <div className="job-info-item">
              <span className="job-info-label">Size:</span>
              <span className="job-info-value">{formatBytes(job.fileSize)}</span>
            </div>
          )}
          <div className="job-info-item">
            <span className="job-info-label">Created:</span>
            <span className="job-info-value">{formatDate(job.createdAt)}</span>
          </div>
        </div>

        {job.status === 'running' && (
          <div className="job-card-progress">
            <ProgressBar progress={progress} label="Progress" />
            <div className="job-metrics">
              <span>Lines: {metrics.linesProcessed.toLocaleString()} / {metrics.totalLines.toLocaleString()}</span>
              <span>Speed: {metrics.speed.toLocaleString()} lines/s</span>
            </div>
          </div>
        )}

        {job.status === 'completed' && (
          <div className="job-card-result">
            <span className="job-result-success">✓ Job completed successfully</span>
            {job.result?.stats && (
              <div className="job-result-stats">
                {job.type === 'wordcount' && (
                  <>
                    <span>Words: {job.result.stats.words?.toLocaleString() ?? '—'}</span>
                    <span>Lines: {job.result.stats.lines?.toLocaleString() ?? '—'}</span>
                    <span>Characters: {job.result.stats.characters?.toLocaleString() ?? '—'}</span>
                  </>
                )}
                {job.type !== 'wordcount' && job.result.stats && (
                  <span>Result: {JSON.stringify(job.result.stats)}</span>
                )}
              </div>
            )}
          </div>
        )}

        {job.status === 'failed' && (
          <div className="job-card-result">
            <span className="job-result-error">✗ Job failed</span>
          </div>
        )}
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
