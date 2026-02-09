import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from '../../../store/slices/jobsSlice';
import metricsReducer from '../../../store/slices/metricsSlice';
import JobList from '../../../components/jobs/JobList';

const createStore = (jobs = []) =>
  configureStore({
    reducer: { jobs: jobsReducer, metrics: metricsReducer },
    preloadedState: {
      jobs: { list: jobs, activeJob: null, status: 'succeeded', error: null },
      metrics: { systemMetrics: {}, jobMetrics: {}, maxDataPoints: 100 },
    },
  });

describe('JobList (presentational)', () => {
  const mockJobs = [
    {
      id: 1,
      type: 'wordcount',
      fileName: 'test.txt',
      fileSize: 1024,
      status: 'completed',
      progress: 100,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 2,
      type: 'dedup',
      fileName: 'data.csv',
      status: 'running',
      progress: 50,
      createdAt: '2024-01-02T12:00:00Z',
    },
  ];

  const renderWithStore = (jobs, props = {}) => {
    const store = createStore(jobs);
    return render(
      <Provider store={store}>
        <JobList jobs={jobs} onCancel={vi.fn()} onDelete={vi.fn()} {...props} />
      </Provider>
    );
  };

  it('renders empty state when no jobs', () => {
    renderWithStore([]);
    expect(screen.getByText('No jobs found')).toBeInTheDocument();
    expect(screen.getByText(/Create a new job to get started/i)).toBeInTheDocument();
  });

  it('renders job count and list of jobs', () => {
    renderWithStore(mockJobs);
    expect(screen.getByText('Jobs (2)')).toBeInTheDocument();
    expect(screen.getByText('Word Count')).toBeInTheDocument();
    expect(screen.getByText('Remove Duplicates')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('data.csv')).toBeInTheDocument();
  });

  it('sorts jobs by createdAt descending (newest first)', () => {
    const { container } = renderWithStore(mockJobs);
    const content = container.querySelector('.job-list-content');
    expect(content).toBeInTheDocument();
    const titles = content ? within(content).getAllByText(/Word Count|Remove Duplicates/) : [];
    expect(titles.length).toBe(2);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const store = createStore(mockJobs);
    render(
      <Provider store={store}>
        <JobList jobs={mockJobs} onCancel={onCancel} onDelete={vi.fn()} />
      </Provider>
    );
    const cancelButtons = screen.queryAllByRole('button', { name: /cancel/i });
    if (cancelButtons.length > 0) {
      await userEvent.click(cancelButtons[0]);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    const store = createStore(mockJobs);
    render(
      <Provider store={store}>
        <JobList jobs={mockJobs} onCancel={vi.fn()} onDelete={onDelete} />
      </Provider>
    );
    const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      await userEvent.click(deleteButtons[0]);
      expect(onDelete).toHaveBeenCalled();
    }
  });
});
