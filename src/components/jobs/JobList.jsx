import React, { memo, useMemo } from 'react';
import JobCard from './JobCard';
import './JobList.css';

/**
 * Presentational: receives jobs and callbacks from container. No Redux.
 */
const JobList = memo(({ jobs = [], filter = 'all', onCancel, onDelete }) => {
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [jobs]);

  if (sortedJobs.length === 0) {
    return (
      <div className="job-list-empty">
        <p>No jobs found</p>
        <p className="job-list-empty-hint">Create a new job to get started</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      <div className="job-list-header">
        <h2>Jobs ({sortedJobs.length})</h2>
      </div>
      <div className="job-list-content">
        {sortedJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
});

JobList.displayName = 'JobList';

export default JobList;
