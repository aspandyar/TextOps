import React, { memo, useMemo } from 'react';
import JobCard from './JobCard';
import './JobList.css';

/**
 * Presentational: receives jobs and callbacks from container. No Redux.
 */
const JobList = memo(({ jobs = [], filter: _filter = 'all', onCancel, onDelete, isAuthenticated = true }) => {
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [jobs]);

  if (sortedJobs.length === 0) {
    return (
      <div className="job-list-empty">
        <p>{isAuthenticated ? 'No jobs found' : 'Log in to see your jobs'}</p>
        <p className="job-list-empty-hint">
          {isAuthenticated ? 'Create a new job to get started' : 'Log in from the header to create and view jobs'}
        </p>
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
