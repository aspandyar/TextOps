import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

// Setup MSW worker for browser (development)
export const worker = setupWorker(...handlers);
