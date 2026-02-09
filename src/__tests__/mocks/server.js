import { setupServer } from 'msw/node';
import { handlers, errorHandlers } from './handlers.js';

// Setup MSW server for Node.js (testing environment)
export const server = setupServer(...handlers);

// Export error handlers for use in tests
export { errorHandlers };
