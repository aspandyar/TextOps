import { createSlice } from '@reduxjs/toolkit';

const metricsSlice = createSlice({
  name: 'metrics',
  initialState: {
    systemMetrics: {
      cpu: [],
      memory: [],
      gpu: [],
      network: [],
      disk: [],
    },
    jobMetrics: {}, // jobId -> metrics array
    maxDataPoints: 100, // Limit data points for performance
  },
  reducers: {
    updateSystemMetrics: (state, action) => {
      const { type, value, timestamp } = action.payload;
      if (state.systemMetrics[type]) {
        state.systemMetrics[type].push({ value, timestamp });
        // Keep only last maxDataPoints
        if (state.systemMetrics[type].length > state.maxDataPoints) {
          state.systemMetrics[type].shift();
        }
      }
    },
    updateJobMetrics: (state, action) => {
      const { jobId, metrics } = action.payload;
      if (!state.jobMetrics[jobId]) {
        state.jobMetrics[jobId] = [];
      }
      state.jobMetrics[jobId].push({
        ...metrics,
        timestamp: Date.now(),
      });
      // Keep only last maxDataPoints
      if (state.jobMetrics[jobId].length > state.maxDataPoints) {
        state.jobMetrics[jobId].shift();
      }
    },
    clearJobMetrics: (state, action) => {
      delete state.jobMetrics[action.payload];
    },
    clearAllMetrics: (state) => {
      Object.keys(state.systemMetrics).forEach(key => {
        state.systemMetrics[key] = [];
      });
      state.jobMetrics = {};
    },
  },
});

export const { updateSystemMetrics, updateJobMetrics, clearJobMetrics, clearAllMetrics } = metricsSlice.actions;
export default metricsSlice.reducer;
