import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper to simulate network delay
const delay = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Mock jobs data
let mockJobs = [
  {
    id: '1',
    type: 'word-count',
    fileName: 'test.txt',
    fileSize: 1024,
    filePath: '/uploads/test.txt',
    status: 'completed',
    progress: 100,
    options: {},
    result: 'Total words: 5000',
    errorMessage: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:05:00Z',
    completedAt: '2024-01-01T00:05:00Z',
  },
  {
    id: '2',
    type: 'remove-duplicates',
    fileName: 'data.csv',
    fileSize: 2048,
    filePath: '/uploads/data.csv',
    status: 'processing',
    progress: 50,
    options: { caseSensitive: false },
    result: null,
    errorMessage: null,
    createdAt: '2024-01-01T01:00:00Z',
    updatedAt: '2024-01-01T01:02:00Z',
    completedAt: null,
  },
];

export const handlers = [
  // GET /api/jobs - Get all jobs
  http.get(`${API_BASE_URL}/jobs`, async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    // Simulate network delay
    await delay(100);

    let filteredJobs = [...mockJobs];
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    if (type) {
      filteredJobs = filteredJobs.filter(job => job.type === type);
    }

    return HttpResponse.json(filteredJobs);
  }),

  // GET /api/jobs/:id - Get a specific job
  http.get(`${API_BASE_URL}/jobs/:id`, async ({ params }) => {
    await delay(50);
    const job = mockJobs.find(j => j.id === params.id);
    
    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(job);
  }),

  // POST /api/jobs - Create a new job
  http.post(`${API_BASE_URL}/jobs`, async ({ request }) => {
    try {
      await delay(200);
      
      const formData = await request.formData();
      const file = formData.get('file');
      const jobType = formData.get('jobType');
      const options = formData.get('options');

      if (!file || !jobType) {
        return HttpResponse.json(
          { error: 'File and job type are required' },
          { status: 400 }
        );
      }

      let parsedOptions = {};
      if (options) {
        try {
          parsedOptions = JSON.parse(options);
        } catch (e) {
          // If options is not valid JSON, use empty object
          parsedOptions = {};
        }
      }

      const newJob = {
        id: String(Date.now()),
        type: jobType,
        fileName: file.name,
        fileSize: file.size,
        filePath: `/uploads/${Date.now()}-${file.name}`,
        status: 'pending',
        progress: 0,
        options: parsedOptions,
        result: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
      };

      mockJobs.push(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      // Handle any errors during formData parsing or job creation
      console.error('Error in POST /jobs handler:', error);
      return HttpResponse.json(
        { error: error.message || 'Failed to create job' },
        { status: 500 }
      );
    }
  }),

  // POST /api/jobs/:id/cancel - Cancel a job
  http.post(`${API_BASE_URL}/jobs/:id/cancel`, async ({ params }) => {
    await delay(100);
    const job = mockJobs.find(j => j.id === params.id);
    
    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      return HttpResponse.json(
        { error: `Cannot cancel job with status: ${job.status}` },
        { status: 400 }
      );
    }

    job.status = 'cancelled';
    return HttpResponse.json({ message: 'Job cancelled successfully', id: params.id });
  }),

  // DELETE /api/jobs/:id - Delete a job
  http.delete(`${API_BASE_URL}/jobs/:id`, async ({ params }) => {
    await delay(100);
    const index = mockJobs.findIndex(j => j.id === params.id);
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    mockJobs.splice(index, 1);
    return HttpResponse.json({ message: 'Job deleted successfully', id: params.id });
  }),

  // GET /api/jobs/:id/result - Get job result
  http.get(`${API_BASE_URL}/jobs/:id/result`, async ({ params }) => {
    await delay(50);
    const job = mockJobs.find(j => j.id === params.id);
    
    if (!job) {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'completed') {
      return HttpResponse.json(
        { error: 'Job is not completed yet' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      id: job.id,
      result: job.result,
      completedAt: job.completedAt,
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  // 500 error on all requests
  serverError: [
    http.get(`${API_BASE_URL}/jobs`, () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }),
    http.post(`${API_BASE_URL}/jobs`, () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }),
    http.get(`${API_BASE_URL}/jobs/:id`, () => {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }),
  ],

  // 404 error on all requests
  notFound: [
    http.get(`${API_BASE_URL}/jobs/:id`, () => {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }),
    http.post(`${API_BASE_URL}/jobs/:id/cancel`, () => {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }),
    http.delete(`${API_BASE_URL}/jobs/:id`, () => {
      return HttpResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }),
  ],

  // Network error (timeout)
  networkError: [
    http.get(`${API_BASE_URL}/jobs`, async () => {
      await delay(35000); // Longer than timeout
      return HttpResponse.json({});
    }),
  ],

  // Slow response (for loading state testing)
  slowResponse: [
    http.get(`${API_BASE_URL}/jobs`, async () => {
      await delay(2000); // 2 second delay
      return HttpResponse.json(mockJobs);
    }),
    http.post(`${API_BASE_URL}/jobs`, async () => {
      await delay(2000);
      return HttpResponse.json({
        id: 'slow-job',
        type: 'word-count',
        fileName: 'slow.txt',
        fileSize: 1024,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
      }, { status: 201 });
    }),
  ],
};

// Reset mock data
export const resetMockJobs = () => {
  mockJobs = [
    {
      id: '1',
      type: 'word-count',
      fileName: 'test.txt',
      fileSize: 1024,
      filePath: '/uploads/test.txt',
      status: 'completed',
      progress: 100,
      options: {},
      result: 'Total words: 5000',
      errorMessage: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:05:00Z',
      completedAt: '2024-01-01T00:05:00Z',
    },
  ];
};
