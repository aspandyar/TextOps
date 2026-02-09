import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveJob } from '../store/slices/jobsSlice';
import { selectJobById } from '../store/selectors/jobSelectors';
import { useJobMetrics } from '../hooks/useJobMetrics';
import JobDetailView from '../components/jobs/JobDetailView';
import '../pages/JobDetailPage.css';

/**
 * Container: resolves job from route params, subscribes to metrics, sets active job,
 * and passes job + onBack to presentational JobDetailView.
 */
const JobDetailContainer = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jobIdNum = parseInt(jobId, 10) || 0;

  const job = useSelector(state => selectJobById(state, jobIdNum));
  useJobMetrics(jobIdNum);

  useEffect(() => {
    if (job) {
      dispatch(setActiveJob(job.id));
    }
  }, [job, dispatch]);

  const onBack = () => navigate('/');

  if (!job) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-not-found">
          <h2>Job not found</h2>
          <button onClick={onBack} type="button" className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <JobDetailView
      job={job}
      jobId={jobIdNum}
      onBack={onBack}
    />
  );
};

export default JobDetailContainer;
