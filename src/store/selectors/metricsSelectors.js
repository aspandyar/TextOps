import { createSelector } from '@reduxjs/toolkit';

// Stable empty references so selectors don't return new array/object each time
const EMPTY_ARRAY = [];

/** Memoized: returns job metrics array for jobId, or stable empty array. */
export const selectJobMetrics = createSelector(
  [(state) => state.metrics.jobMetrics, (_, jobId) => jobId],
  (jobMetrics, jobId) => jobMetrics[jobId] ?? EMPTY_ARRAY
);

/** Memoized: returns system metrics array for metricType, or stable empty array. */
export const selectSystemMetricsByType = createSelector(
  [(state) => state.metrics.systemMetrics, (_, metricType) => metricType],
  (systemMetrics, metricType) => systemMetrics[metricType] ?? EMPTY_ARRAY
);
