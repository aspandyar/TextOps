import api from './api';

export const jobService = {
  getAllJobs: async () => {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 100);
    });
  },

  createJob: async (jobData) => {
    const formData = new FormData();
    formData.append('file', jobData.file);
    formData.append('jobType', jobData.jobType);
    formData.append('options', JSON.stringify(jobData.options || {}));

    try {
      const response = await api.post('/jobs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Fallback to mock if API is not available
      return {
        id: Date.now(),
        type: jobData.jobType,
        fileName: jobData.file.name,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        fileSize: jobData.file.size,
      };
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
      // Mock success for development
      return jobId;
    }
  },

  deleteJob: async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      return jobId;
    } catch (error) {
      // Mock success for development
      return jobId;
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
