import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobService } from '../../services/jobService';

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const jobs = await jobService.getAllJobs();
      return jobs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const job = await jobService.createJob(jobData);
      return job;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelJob = createAsyncThunk(
  'jobs/cancelJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobService.cancelJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobService.deleteJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    activeJob: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addJob: (state, action) => {
      state.list.push(action.payload);
    },
    updateJob: (state, action) => {
      const index = state.list.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
    },
    removeJob: (state, action) => {
      state.list = state.list.filter(j => j.id !== action.payload);
    },
    setActiveJob: (state, action) => {
      state.activeJob = action.payload;
    },
    updateJobProgress: (state, action) => {
      const { jobId, progress, status } = action.payload;
      const job = state.list.find(j => j.id === jobId);
      if (job) {
        job.progress = progress;
        if (status) job.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(cancelJob.fulfilled, (state, action) => {
        const job = state.list.find(j => j.id === action.payload);
        if (job) {
          job.status = 'cancelled';
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter(j => j.id !== action.payload);
      });
  },
});

export const { addJob, updateJob, removeJob, setActiveJob, updateJobProgress } = jobsSlice.actions;
export default jobsSlice.reducer;
