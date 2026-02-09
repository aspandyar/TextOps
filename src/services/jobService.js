import api from './api';

export const jobService = {
  getAllJobs: async () => {
    try {
      const response = await api.get('/jobs');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  },

  createJob: async (jobData) => {
    if (!jobData.file) {
      throw new Error('File is required');
    }

    const formData = new FormData();
    formData.append('file', jobData.file);
    formData.append('jobType', jobData.jobType);
    formData.append('options', JSON.stringify(jobData.options || {}));

    try {
      // transformRequest in api.js handles FormData Content-Type automatically
      const response = await api.post('/jobs', formData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  },

  getJob: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  },

  cancelJob: async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/cancel`);
      return jobId;
    } catch (error) {
      throw new Error(`Failed to cancel job: ${error.message}`);
    }
  },

  deleteJob: async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  },

  getJobResult: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/result`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch job result: ${error.message}`);
    }
  },
};
