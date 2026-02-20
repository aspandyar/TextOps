import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectJobsFilteredByStatus } from '../store/selectors/jobSelectors';
import { cancelJob, deleteJob } from '../store/slices/jobsSlice';
import JobList from '../components/jobs/JobList';

/**
 * Container: connects Redux to JobList. Selects filtered jobs and provides
 * cancel/delete handlers. JobList is presentational (no Redux).
 */
const JobListContainer = ({ filter = 'all', onJobClick }) => {
  const dispatch = useDispatch();
  const jobs = useSelector(state => selectJobsFilteredByStatus(state, filter));
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const onCancel = useCallback(
    (jobId) => {
      if (window.confirm('Are you sure you want to cancel this job?')) {
        dispatch(cancelJob(jobId));
      }
    },
    [dispatch]
  );

  const onDelete = useCallback(
    (jobId) => {
      if (window.confirm('Are you sure you want to delete this job?')) {
        dispatch(deleteJob(jobId));
      }
    },
    [dispatch]
  );

  return (
    <JobList
      jobs={jobs}
      filter={filter}
      onCancel={onCancel}
      onDelete={onDelete}
      onJobClick={onJobClick}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default JobListContainer;
