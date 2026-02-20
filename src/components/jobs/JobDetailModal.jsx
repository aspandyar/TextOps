import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectJobById } from '../../store/selectors/jobSelectors';
import { setActiveJob } from '../../store/slices/jobsSlice';
import { useJobMetrics } from '../../hooks/useJobMetrics';
import JobDetailView from './JobDetailView';
import '../../pages/JobDetailPage.css';
import './JobDetailModal.css';

/**
 * Modal that shows job detail. Uses job from Redux (must be in list); fetches if needed via getJob.
 */
const JobDetailModal = ({ jobId, onClose }) => {
  const dispatch = useDispatch();
  const job = useSelector((state) => selectJobById(state, jobId));
  useJobMetrics(jobId);

  useEffect(() => {
    if (job) dispatch(setActiveJob(job.id));
  }, [job, dispatch]);

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [onClose]);

  if (!jobId) return null;

  const content = (
    <div className="job-detail-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="job-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        {!job ? (
          <div className="job-detail-not-found">
            <h2>Job not found</h2>
            <button onClick={onClose} type="button" className="back-button">
              Close
            </button>
          </div>
        ) : (
          <JobDetailView job={job} jobId={jobId} onClose={onClose} />
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default JobDetailModal;
