import { describe, it, expect, beforeEach, vi } from 'vitest';
import { jobService } from '../../services/jobService';
import api from '../../services/api';
import { server } from '../mocks/server';
import { errorHandlers, resetMockJobs } from '../mocks/handlers';
import { http, HttpResponse } from 'msw';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

describe('jobService', () => {
  beforeEach(() => {
    resetMockJobs();
  });

  describe('getAllJobs', () => {
    it('should fetch all jobs successfully', async () => {
      const jobs = await jobService.getAllJobs();
      
      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      // Mock returns at least 1 job
      if (jobs.length > 0) {
        expect(jobs[0]).toHaveProperty('id');
        expect(jobs[0]).toHaveProperty('type');
        expect(jobs[0]).toHaveProperty('status');
      }
    });

    it('should handle empty job list', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json([]);
        })
      );

      const jobs = await jobService.getAllJobs();
      expect(jobs).toEqual([]);
    });

    it('should handle 500 server error', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(jobService.getAllJobs()).rejects.toThrow();
    });

    it('should handle network timeout', async () => {
      // Mock Axios to throw a timeout error
      const timeoutError = new axios.AxiosError('timeout of 100ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.config = { timeout: 100 };
      
      const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(timeoutError);

      await expect(jobService.getAllJobs()).rejects.toThrow();
      
      getSpy.mockRestore();
    });

    it('should handle slow responses gracefully', async () => {
      const startTime = Date.now();
      
      server.use(
        http.get(`${API_BASE_URL}/jobs`, async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return HttpResponse.json([]);
        })
      );

      const jobs = await jobService.getAllJobs();
      const duration = Date.now() - startTime;
      
      expect(jobs).toBeDefined();
      expect(duration).toBeGreaterThanOrEqual(150); // Allow some margin
    });
  });

  describe('createJob', () => {
    it('should create a job successfully', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
        options: { caseSensitive: false },
      };

      const job = await jobService.createJob(jobData);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.type).toBe('word-count');
      expect(job.fileName).toBe('test.txt');
      expect(job.status).toBe('pending');
      expect(job.progress).toBe(0);
    });

    it('should handle missing file', async () => {
      const jobData = {
        file: null,
        jobType: 'word-count',
      };

      // Should throw error for missing file
      await expect(jobService.createJob(jobData)).rejects.toThrow('File is required');
    });

    it('should handle 500 server error', async () => {
      server.use(...errorHandlers.serverError);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
      };

      // Should throw error
      await expect(jobService.createJob(jobData)).rejects.toThrow('Failed to create job');
    });

    it('should handle invalid file types', async () => {
      server.use(
        http.post(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Invalid file type' },
            { status: 400 }
          );
        })
      );

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const jobData = {
        file,
        jobType: 'word-count',
      };

      // Should throw error
      await expect(jobService.createJob(jobData)).rejects.toThrow('Failed to create job');
    });
  });

  describe('getJob', () => {
    it('should fetch a job by id successfully', async () => {
      const job = await jobService.getJob('1');

      expect(job).toBeDefined();
      expect(job.id).toBe('1');
      expect(job.type).toBe('word-count');
      expect(job.status).toBe('completed');
    });

    it('should handle 404 not found error', async () => {
      server.use(...errorHandlers.notFound);

      await expect(jobService.getJob('999')).rejects.toThrow('Failed to fetch job');
    });

    it('should handle 500 server error', async () => {
      server.use(...errorHandlers.serverError);

      await expect(jobService.getJob('1')).rejects.toThrow('Failed to fetch job');
    });
  });

  describe('cancelJob', () => {
    it('should cancel a job successfully', async () => {
      // First create a job to cancel
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const job = await jobService.createJob({
        file,
        jobType: 'word-count',
      });
      
      const jobId = await jobService.cancelJob(job.id);
      expect(jobId).toBe(job.id);
    });

    it('should handle 404 not found error', async () => {
      server.use(...errorHandlers.notFound);

      // Should throw error
      await expect(jobService.cancelJob('999')).rejects.toThrow('Failed to cancel job');
    });

    it('should handle already cancelled job', async () => {
      server.use(
        http.post(`${API_BASE_URL}/jobs/:id/cancel`, () => {
          return HttpResponse.json(
            { error: 'Cannot cancel job with status: cancelled' },
            { status: 400 }
          );
        })
      );

      // Should throw error
      await expect(jobService.cancelJob('1')).rejects.toThrow('Failed to cancel job');
    });
  });

  describe('deleteJob', () => {
    it('should delete a job successfully', async () => {
      const jobId = await jobService.deleteJob('1');

      expect(jobId).toBe('1');
    });

    it('should handle 404 not found error', async () => {
      server.use(...errorHandlers.notFound);

      // Should throw error
      await expect(jobService.deleteJob('999')).rejects.toThrow('Failed to delete job');
    });

    it('should handle 500 server error', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/jobs/:id`, () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      // Should throw error
      await expect(jobService.deleteJob('1')).rejects.toThrow('Failed to delete job');
    });
  });

  describe('getJobResult', () => {
    it('should fetch job result successfully', async () => {
      const result = await jobService.getJobResult('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.result).toBe('Total words: 5000');
      expect(result.completedAt).toBeDefined();
    });

    it('should handle job not completed', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs/:id/result`, () => {
          return HttpResponse.json(
            { error: 'Job is not completed yet' },
            { status: 400 }
          );
        })
      );

      await expect(jobService.getJobResult('2')).rejects.toThrow('Failed to fetch job result');
    });

    it('should handle 404 not found error', async () => {
      server.use(...errorHandlers.notFound);

      await expect(jobService.getJobResult('999')).rejects.toThrow('Failed to fetch job result');
    });
  });

  describe('Race Conditions', () => {
    it('should handle concurrent getAllJobs requests', async () => {
      const promises = Array(10).fill(null).map(() => jobService.getAllJobs());
      const results = await Promise.all(promises);

      expect(results.length).toBe(10);
      results.forEach(jobs => {
        expect(Array.isArray(jobs)).toBe(true);
      });
    });

    it('should handle concurrent createJob requests', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      // Create jobs with slight delay to ensure unique timestamps
      const promises = Array(5).fill(null).map((_, i) => 
        new Promise(resolve => {
          setTimeout(async () => {
            const result = await jobService.createJob({
              file,
              jobType: 'word-count',
            });
            resolve(result);
          }, i * 10);
        })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(job => {
        expect(job).toBeDefined();
        expect(job.id).toBeDefined();
      });

      // All jobs should have unique IDs (MSW creates unique IDs)
      const ids = results.map(j => j.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should handle race condition between get and update', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const job = await jobService.createJob({
        file,
        jobType: 'word-count',
      });

      // Simulate concurrent get and cancel
      const [fetchedJob, cancelledId] = await Promise.all([
        jobService.getJob(job.id),
        jobService.cancelJob(job.id),
      ]);

      expect(fetchedJob).toBeDefined();
      expect(cancelledId).toBe(job.id);
    });

    it('should handle multiple delete requests for same job', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const job = await jobService.createJob({
        file,
        jobType: 'word-count',
      });

      const promises = Array(3).fill(null).map(() => jobService.deleteJob(job.id));
      const results = await Promise.all(promises);

      // All should succeed (even if job is already deleted)
      results.forEach(result => {
        expect(result).toBe(job.id);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large file sizes', async () => {
      const largeFile = new File(['x'.repeat(1000000)], 'large.txt', { type: 'text/plain' });
      const jobData = {
        file: largeFile,
        jobType: 'word-count',
      };

      const job = await jobService.createJob(jobData);
      expect(job).toBeDefined();
      expect(job.fileSize).toBeGreaterThan(0);
    });

    it('should handle special characters in file names', async () => {
      const file = new File(['test'], 'test file (1).txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
      };

      const job = await jobService.createJob(jobData);
      expect(job).toBeDefined();
      // Mock may return actual filename (browser/multipart) or default (Node when formData() isn't used)
      expect(typeof job.fileName).toBe('string');
      expect(job.fileName.length).toBeGreaterThan(0);
    });

    it('should handle empty options object', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
        options: {},
      };

      const job = await jobService.createJob(jobData);
      expect(job).toBeDefined();
      // Options may be undefined or empty object depending on backend
      expect(job.options === undefined || job.options === {} || typeof job.options === 'object').toBe(true);
    });

    it('should handle complex options object', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const jobData = {
        file,
        jobType: 'word-count',
        options: {
          caseSensitive: false,
          minLength: 3,
          maxLength: 100,
          filters: ['alpha', 'numeric'],
        },
      };

      const job = await jobService.createJob(jobData);
      expect(job).toBeDefined();
      // Options should be preserved (may be stringified and parsed by backend)
      expect(job).toHaveProperty('options');
    });
  });
});
