import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './slices/jobsSlice';
import metricsReducer from './slices/metricsSlice';
import alertsReducer from './slices/alertsSlice';
import systemReducer from './slices/systemSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    metrics: metricsReducer,
    alerts: alertsReducer,
    system: systemReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['jobs/addJob', 'jobs/updateJob', 'metrics/updateMetrics'],
      },
    }),
});

// Type definitions for TypeScript (commented out for JavaScript project)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
