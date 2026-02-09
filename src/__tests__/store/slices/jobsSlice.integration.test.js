import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer, { fetchJobs, createJob, cancelJob, deleteJob } from '../../../store/slices/jobsSlice';
import { server } from '../../mocks/server';
import { resetMockJobs } from '../../mocks/handlers';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper to create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      jobs: jobsReducer,
    },
  });
};

describe('jobsSlice Integration Tests', () => {
  beforeEach(() => {
    resetMockJobs();
  });

  describe('fetchJobs', () => {
    it('should handle loading state', async () => {
      const store = createTestStore();

      // Start fetching
      const promise = store.dispatch(fetchJobs());

      // Check loading state
      const loadingState = store.getState().jobs;
      expect(loadingState.status).toBe('loading');
      expect(loadingState.list).toEqual([]);

      await promise;

      // Check success state
      const successState = store.getState().jobs;
      expect(successState.status).toBe('succeeded');
      // List may be empty or have items depending on mock data
      expect(Array.isArray(successState.list)).toBe(true);
    });

    it('should handle successful fetch', async () => {
      const store = createTestStore();

      await store.dispatch(fetchJobs());

      const state = store.getState().jobs;
      expect(state.status).toBe('succeeded');
      expect(Array.isArray(state.list)).toBe(true);
      // If list has items, check properties
      if (state.list.length > 0) {
        expect(state.list[0]).toHaveProperty('id');
        expect(state.list[0]).toHaveProperty('type');
      }
    });

    it('should handle 500 error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );
      const store = createTestStore();

      await store.dispatch(fetchJobs());

      const state = store.getState().jobs;
      expect(state.status).toBe('failed');
      expect(state.error).toBeDefined();
    });

    it('should handle 404 error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Not found' },
            { status: 404 }
          );
        })
      );

      const store = createTestStore();
      await store.dispatch(fetchJobs());

      const state = store.getState().jobs;
      expect(state.status).toBe('failed');
    });

    it('should handle slow response and show loading state', async () => {
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

      // Verify loading state
      let state = store.getState().jobs;
      expect(state.status).toBe('loading');

      // Resolve the request
      resolveRequest();
      await fetchPromise;

      // Verify final state
      state = store.getState().jobs;
      expect(state.status).toBe('succeeded');
    });
  });

  describe('createJob', () => {
    it('should create a job successfully', async () => {
      const store = createTestStore();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
        options: {},
      };

      await store.dispatch(createJob(jobData));

      const state = store.getState().jobs;
      expect(state.list.length).toBeGreaterThan(0);
      const createdJob = state.list.find(j => j.type === 'word-count');
      expect(createdJob).toBeDefined();
      expect(createdJob.fileName).toBe('test.txt');
    });

    it('should handle create job error', async () => {
      server.use(
        http.post(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );
      const store = createTestStore();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
      };

      const result = await store.dispatch(createJob(jobData));
      
      // Should be rejected
      expect(result.type).toContain('rejected');
    });

    it('should handle concurrent job creation', async () => {
      const store = createTestStore();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const promises = Array(5).fill(null).map((_, i) =>
        store.dispatch(createJob({
          file,
          jobType: 'word-count',
        }))
      );

      await Promise.all(promises);

      const state = store.getState().jobs;
      expect(state.list.length).toBe(5);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a job successfully', async () => {
      const store = createTestStore();
      
      // First create a job
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await store.dispatch(createJob({
        file,
        jobType: 'word-count',
      }));

      const jobId = store.getState().jobs.list[0].id;

      // Cancel the job
      await store.dispatch(cancelJob(jobId));

      const state = store.getState().jobs;
      const cancelledJob = state.list.find(j => j.id === jobId);
      expect(cancelledJob.status).toBe('cancelled');
    });

    it('should handle cancel error gracefully', async () => {
      server.use(
        http.post(`${API_BASE_URL}/jobs/999/cancel`, () => {
          return HttpResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        })
      );
      const store = createTestStore();

      const result = await store.dispatch(cancelJob('999'));

      // Should be rejected
      expect(result.type).toContain('rejected');
    });
  });

  describe('deleteJob', () => {
    it('should delete a job successfully', async () => {
      const store = createTestStore();
      
      // First create a job
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await store.dispatch(createJob({
        file,
        jobType: 'word-count',
      }));

      const jobId = store.getState().jobs.list[0].id;
      const initialLength = store.getState().jobs.list.length;

      // Delete the job
      await store.dispatch(deleteJob(jobId));

      const state = store.getState().jobs;
      expect(state.list.length).toBe(initialLength - 1);
      expect(state.list.find(j => j.id === jobId)).toBeUndefined();
    });

    it('should handle delete error gracefully', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/jobs/999`, () => {
          return HttpResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        })
      );
      const store = createTestStore();

      const result = await store.dispatch(deleteJob('999'));

      // Should be rejected
      expect(result.type).toContain('rejected');
    });
  });

  describe('Race Conditions', () => {
    it('should handle race condition between fetch and create', async () => {
      const store = createTestStore();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      // Start both operations concurrently
      const [fetchResult, createResult] = await Promise.all([
        store.dispatch(fetchJobs()),
        store.dispatch(createJob({ file, jobType: 'word-count' })),
      ]);

      const state = store.getState().jobs;
      
      // Both should succeed
      expect(fetchResult.type).toContain('fulfilled');
      expect(createResult.type).toContain('fulfilled');
      
      // State should be consistent - at least the created job should be there
      expect(state.list.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple concurrent fetches', async () => {
      const store = createTestStore();

      const promises = Array(10).fill(null).map(() => store.dispatch(fetchJobs()));
      await Promise.all(promises);

      const state = store.getState().jobs;
      expect(state.status).toBe('succeeded');
      expect(Array.isArray(state.list)).toBe(true);
    });

    it('should handle race condition between cancel and delete', async () => {
      const store = createTestStore();
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await store.dispatch(createJob({ file, jobType: 'word-count' }));
      const jobId = store.getState().jobs.list[0].id;

      // Try to cancel and delete simultaneously
      await Promise.all([
        store.dispatch(cancelJob(jobId)),
        store.dispatch(deleteJob(jobId)),
      ]);

      const state = store.getState().jobs;
      // Job should be deleted (delete wins)
      expect(state.list.find(j => j.id === jobId)).toBeUndefined();
    });
  });

  describe('Loading States', () => {
    it('should maintain loading state during slow requests', async () => {
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

      // Check loading state immediately (should be loading)
      const initialStatus = store.getState().jobs.status;
      expect(initialStatus).toBe('loading');

      // Resolve quickly and verify final state
      resolveRequest();
      await fetchPromise;

      const finalState = store.getState().jobs;
      expect(finalState.status).toBe('succeeded');
    });
  });
});
