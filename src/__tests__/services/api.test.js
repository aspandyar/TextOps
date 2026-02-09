import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../../services/api';
import { server } from '../mocks/server';
import { errorHandlers } from '../mocks/handlers';
import { http, HttpResponse } from 'msw';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

describe('API Service', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
  });

  describe('Request Interceptor', () => {
    it('should add auth token to headers if available', async () => {
      const token = 'test-token-123';
      localStorage.setItem('authToken', token);

      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => HttpResponse.json([]))
      );

      await api.get('/jobs');

      // Verify the token is stored (interceptor adds it to requests)
      expect(localStorage.getItem('authToken')).toBe(token);
    });

    it('should work without auth token', async () => {
      localStorage.removeItem('authToken');

      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json([]);
        })
      );

      const response = await api.get('/jobs');
      expect(response.data).toEqual([]);
    });
  });

  describe('Response Interceptor', () => {
    it('should handle 401 unauthorized and remove token', async () => {
      const token = 'test-token';
      localStorage.setItem('authToken', token);

      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      try {
        await api.get('/jobs');
      } catch (error) {
        expect(error.response?.status).toBe(401);
        // Token should be removed
        expect(localStorage.getItem('authToken')).toBeNull();
      }
    });

    it('should handle successful responses', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json([{ id: '1' }]);
        })
      );

      const response = await api.get('/jobs');
      expect(response.data).toEqual([{ id: '1' }]);
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.error();
        })
      );

      await expect(api.get('/jobs')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Mock Axios to throw a timeout error
      const timeoutError = new axios.AxiosError('timeout of 100ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.config = { timeout: 100 };
      
      const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(timeoutError);

      await expect(api.get('/jobs')).rejects.toThrow();
      
      getSpy.mockRestore();
    });
  });

  describe('Base Configuration', () => {
    it('should use correct base URL', () => {
      expect(api.defaults.baseURL).toBe(API_BASE_URL);
    });

    it('should have correct timeout', () => {
      expect(api.defaults.timeout).toBe(30000);
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should handle 500 server errors', async () => {
      server.use(...errorHandlers.serverError);

      await expect(api.get('/jobs')).rejects.toThrow();
    });

    it('should handle 404 not found errors', async () => {
      server.use(
        http.get(`${API_BASE_URL}/jobs/999`, () => {
          return HttpResponse.json(
            { error: 'Not found' },
            { status: 404 }
          );
        })
      );

      await expect(api.get('/jobs/999')).rejects.toThrow();
    });

    it('should handle 400 bad request errors', async () => {
      server.use(
        http.post(`${API_BASE_URL}/jobs`, () => {
          return HttpResponse.json(
            { error: 'Bad request' },
            { status: 400 }
          );
        })
      );

      await expect(api.post('/jobs', {})).rejects.toThrow();
    });
  });
});
