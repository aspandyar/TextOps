import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllJobs, selectJobsByStatus } from '../../store/selectors/jobSelectors';
import JobCard from './JobCard';
import './JobList.css';

const JobList = memo(({ filter = 'all' }) => {
  const allJobs = useSelector(selectAllJobs);
  // Use memoized selector - selectJobsByStatus is already memoized via createSelector
  const filteredJobsByStatus = useSelector(state => 
    filter === 'all' ? allJobs : selectJobsByStatus(state, filter)
  );

  const sortedJobs = useMemo(() => {
    return [...filteredJobsByStatus].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [filteredJobsByStatus]);

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
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
});

JobList.displayName = 'JobList';

export default JobList;
