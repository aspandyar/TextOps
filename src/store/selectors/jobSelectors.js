import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectAllJobs = (state) => state.jobs.list;
export const selectActiveJob = (state) => state.jobs.activeJob;
export const selectJobsStatus = (state) => state.jobs.status;

// Memoized selectors
export const selectJobsByStatus = createSelector(
  [selectAllJobs, (state, status) => status],
  (jobs, status) => jobs.filter(job => job.status === status)
);

export const selectRunningJobs = createSelector(
  [selectAllJobs],
  (jobs) => jobs.filter(job => job.status === 'running')
);

export const selectCompletedJobs = createSelector(
  [selectAllJobs],
  (jobs) => jobs.filter(job => job.status === 'completed')
);

export const selectJobById = createSelector(
  [selectAllJobs, (state, jobId) => jobId],
  (jobs, jobId) => jobs.find(job => job.id === jobId)
);

export const selectJobsStats = createSelector(
  [selectAllJobs],
  (jobs) => ({
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    pending: jobs.filter(j => j.status === 'pending').length,
  })
);
