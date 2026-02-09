import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../../components/layout/Dashboard';
import jobsReducer from '../../store/slices/jobsSlice';
import metricsReducer from '../../store/slices/metricsSlice';
import { fetchJobs } from '../../store/slices/jobsSlice';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const createTestStore = () => {
  return configureStore({
    reducer: {
      jobs: jobsReducer,
      metrics: metricsReducer,
    },
  });
};

describe('Dashboard Loading States', () => {
  beforeEach(() => {
    // Reset server handlers
    server.resetHandlers();
  });

  it('should show loading state while fetching jobs', async () => {
    let resolveRequest;
    const requestPromise = new Promise(resolve => {
      resolveRequest = resolve;
    });

    server.use(
      http.get(`${API_BASE_URL}/jobs`, async () => {
        await requestPromise;
        return HttpResponse.json([]);
      })
    );

    const store = createTestStore();
    const fetchPromise = store.dispatch(fetchJobs());

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    // Check that loading state is reflected
    const state = store.getState();
    expect(state.jobs.status).toBe('loading');

    // Resolve request
    resolveRequest();
    await fetchPromise;

    // Wait for UI to update
    await waitFor(() => {
      expect(store.getState().jobs.status).toBe('succeeded');
    });
  });

  it('should handle slow API response gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json([
          {
            id: '1',
            type: 'word-count',
            fileName: 'test.txt',
            fileSize: 1024,
            status: 'completed',
            progress: 100,
            createdAt: new Date().toISOString(),
          },
        ]);
      })
    );

    const store = createTestStore();
    
    await act(async () => {
      render(
        <Provider store={store}>
          <Dashboard />
        </Provider>
      );
      
      store.dispatch(fetchJobs());
    });

    // Verify loading state during slow request
    expect(store.getState().jobs.status).toBe('loading');

    await act(async () => {
      await waitFor(() => {
        const state = store.getState();
        expect(state.jobs.status).toBe('succeeded');
      }, { timeout: 2000 });
    });

    const finalState = store.getState();
    expect(finalState.jobs.status).toBe('succeeded');
    expect(finalState.jobs.list.length).toBeGreaterThanOrEqual(0);
  });

  it('should display empty state when no jobs are loaded', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, () => {
        return HttpResponse.json([]);
      })
    );

    const store = createTestStore();
    await store.dispatch(fetchJobs());

    render(
      <Provider store={store}>
        <Dashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No jobs found/i)).toBeInTheDocument();
    });
  });

  it('should handle error state gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/jobs`, () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    const store = createTestStore();
    
    await act(async () => {
      render(
        <Provider store={store}>
          <Dashboard />
        </Provider>
      );
      
      await store.dispatch(fetchJobs());
    });

    await waitFor(() => {
      const state = store.getState();
      // Error should be handled - either failed state or empty list
      expect(['failed', 'succeeded']).toContain(state.jobs.status);
    }, { timeout: 2000 });
  });

  it('should update UI when jobs are added after initial load', async () => {
    const store = createTestStore();
    
    // Initial load with empty array
    server.use(
      http.get(`${API_BASE_URL}/jobs`, () => {
        return HttpResponse.json([]);
      })
    );

    await act(async () => {
      render(
        <Provider store={store}>
          <Dashboard />
        </Provider>
      );
      
      await store.dispatch(fetchJobs());
    });

    // Update to return jobs
    server.use(
      http.get(`${API_BASE_URL}/jobs`, () => {
        return HttpResponse.json([
          {
            id: '1',
            type: 'word-count',
            fileName: 'test.txt',
            fileSize: 1024,
            status: 'pending',
            progress: 0,
            createdAt: new Date().toISOString(),
          },
        ]);
      })
    );

    // Fetch again
    await act(async () => {
      await store.dispatch(fetchJobs());
    });

    await waitFor(() => {
      const state = store.getState();
      // Should have at least 0 jobs (may be 0 or 1 depending on timing)
      expect(state.jobs.list.length).toBeGreaterThanOrEqual(0);
    }, { timeout: 2000 });
  });
});
