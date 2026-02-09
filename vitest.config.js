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
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.config.js',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}',
        'e2e/',
      ],
      include: [
        'src/services/**/*.{js,jsx}',
        'src/store/**/*.{js,jsx}',
        'src/utils/**/*.{js,jsx}',
        'src/components/**/*.{js,jsx}',
        'src/pages/**/*.{js,jsx}',
        'src/containers/**/*.{js,jsx}',
        'src/hooks/**/*.js',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
