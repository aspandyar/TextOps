import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveJob } from '../store/slices/jobsSlice';
import { useJobMetrics } from '../hooks/useJobMetrics';
import Header from '../components/layout/Header';
import JobProgress from '../components/jobs/JobProgress';
import JobMetrics from '../components/jobs/JobMetrics';
import StatCard from '../components/common/StatCard';
import { formatDate, formatBytes } from '../utils/formatters';
import './JobDetailPage.css';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const jobIdNum = parseInt(jobId, 10);

  const job = useSelector(state => 
    state.jobs.list.find(j => j.id === jobIdNum)
  );

  useJobMetrics(jobIdNum);

  useMemo(() => {
    if (job) {
      dispatch(setActiveJob(job.id));
    }
  }, [job, dispatch]);

  if (!job) {
    return (
      <div className="job-detail-page">
        <Header />
        <div className="job-detail-not-found">
          <h2>Job not found</h2>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <Header />
      <div className="job-detail-content">
        <button onClick={() => navigate('/')} className="back-button">
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
            <JobProgress jobId={jobIdNum} />
          </div>
        )}

        <div className="job-detail-metrics">
          <JobMetrics jobId={jobIdNum} />
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
