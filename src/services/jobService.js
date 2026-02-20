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

  /** Download result file (for sort/dedup/clean). Triggers browser download. */
  downloadResultFile: async (jobId, fileName) => {
    const response = await api.get(`/jobs/${jobId}/download`, { responseType: 'blob' });
    const blob = response.data;
    const name = fileName || response.headers['content-disposition']?.match(/filename="?([^"]+)"?/)?.[1] || 'result.txt';
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  /** Get output text for display (for sort/dedup/clean). Returns { text } or { tooLarge: true }. */
  getOutputText: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}/output`, { responseType: 'text' });
      return { text: response.data };
    } catch (err) {
      if (err.response?.status === 413) return { tooLarge: true };
      if (err.response?.status === 400) return { statsOnly: true };
      throw err;
    }
  },
};
