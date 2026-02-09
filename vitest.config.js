import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      'e2e/**',
      '**/*.e2e.{js,jsx,ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.js',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        'e2e/',
      ],
      // Only measure coverage for critical logic (jobs flow, store, services, utils)
      include: [
        'src/services/api.js',
        'src/services/jobService.js',
        'src/store/slices/jobsSlice.js',
        'src/store/selectors/jobSelectors.js',
        'src/utils/**/*.js',
        'src/components/jobs/JobList.jsx',
        'src/components/jobs/JobCard.jsx',
        'src/containers/JobListContainer.jsx',
        'src/components/layout/Dashboard.jsx',
        'src/hooks/useJobProgress.js',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
});
