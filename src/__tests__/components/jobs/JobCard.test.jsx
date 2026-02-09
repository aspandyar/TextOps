import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from '../../../store/slices/jobsSlice';
import metricsReducer from '../../../store/slices/metricsSlice';
import JobCard from '../../../components/jobs/JobCard';

const createStore = (job) => {
  return configureStore({
    reducer: {
      jobs: jobsReducer,
      metrics: metricsReducer,
    },
    preloadedState: {
      jobs: {
        list: [job],
        activeJob: null,
        status: 'succeeded',
        error: null,
      },
      metrics: {
        systemMetrics: {},
        jobMetrics: { [job.id]: [] },
        maxDataPoints: 100,
      },
    },
  });
};

describe('JobCard', () => {
  const completedJob = {
    id: 1,
    type: 'wordcount',
    fileName: 'test.txt',
    fileSize: 1024,
    status: 'completed',
    progress: 100,
    createdAt: '2024-01-01T12:00:00Z',
    result: { stats: { words: 100, lines: 10, characters: 500 } },
  };

  const runningJob = {
    id: 2,
    type: 'dedup',
    fileName: 'data.csv',
    status: 'running',
    progress: 50,
    createdAt: '2024-01-02T12:00:00Z',
  };

  beforeEach(() => {
    vi.stubGlobal('window', { ...window, confirm: vi.fn(() => true) });
  });

  it('renders job type and file name', () => {
    const store = createStore(completedJob);
    render(
      <Provider store={store}>
        <JobCard job={completedJob} onCancel={vi.fn()} onDelete={vi.fn()} />
      </Provider>
    );
    expect(screen.getByText('Word Count')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('renders completed status and result', () => {
    const store = createStore(completedJob);
    render(
      <Provider store={store}>
        <JobCard job={completedJob} onCancel={vi.fn()} onDelete={vi.fn()} />
      </Provider>
    );
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText(/Job completed successfully/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn();
    const store = createStore(completedJob);
    render(
      <Provider store={store}>
        <JobCard job={completedJob} onCancel={vi.fn()} onDelete={onDelete} />
      </Provider>
    );
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(completedJob.id);
  });

  it('shows cancel button for running job', () => {
    const store = createStore(runningJob);
    render(
      <Provider store={store}>
        <JobCard job={runningJob} onCancel={vi.fn()} onDelete={vi.fn()} />
      </Provider>
    );
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
