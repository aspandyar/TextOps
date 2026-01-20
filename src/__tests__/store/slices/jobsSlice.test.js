import { describe, it, expect } from 'vitest';
import jobsReducer, { addJob, updateJob, removeJob, setActiveJob } from '../../../store/slices/jobsSlice';

describe('jobsSlice', () => {
  const initialState = {
    list: [],
    activeJob: null,
    status: 'idle',
    error: null,
  };

  it('should return initial state', () => {
    expect(jobsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addJob', () => {
    const job = {
      id: 1,
      type: 'wordcount',
      fileName: 'test.txt',
      status: 'pending',
      progress: 0,
    };
    const action = addJob(job);
    const state = jobsReducer(initialState, action);
    expect(state.list).toHaveLength(1);
    expect(state.list[0]).toEqual(job);
  });

  it('should handle updateJob', () => {
    const initialState = {
      list: [{ id: 1, progress: 0, status: 'pending' }],
      activeJob: null,
      status: 'idle',
      error: null,
    };
    const action = updateJob({ id: 1, progress: 50, status: 'running' });
    const state = jobsReducer(initialState, action);
    expect(state.list[0].progress).toBe(50);
    expect(state.list[0].status).toBe('running');
  });

  it('should handle removeJob', () => {
    const initialState = {
      list: [{ id: 1 }, { id: 2 }],
      activeJob: null,
      status: 'idle',
      error: null,
    };
    const action = removeJob(1);
    const state = jobsReducer(initialState, action);
    expect(state.list).toHaveLength(1);
    expect(state.list[0].id).toBe(2);
  });

  it('should handle setActiveJob', () => {
    const action = setActiveJob(1);
    const state = jobsReducer(initialState, action);
    expect(state.activeJob).toBe(1);
  });
});
