# Testing Guide

This document describes the testing setup for the TextOps frontend application.

## Test Structure

### Unit Tests
- Located in `src/__tests__/`
- Test individual functions and components in isolation
- Use Vitest as the test runner

### Integration Tests
- Located in `src/__tests__/`
- Test interactions between services, Redux slices, and components
- Use MSW (Mock Service Worker) to mock API responses

### E2E Tests
- Located in `e2e/`
- Test complete user flows
- Use Playwright for browser automation

## Test Coverage Requirements

- **Services**: >80% coverage
- **Store/Redux**: >80% coverage
- **Utils**: >80% coverage

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### All Tests
```bash
# Run unit tests with coverage and E2E tests
npm run test:all
```

## MSW (Mock Service Worker)

MSW is used to intercept and mock API requests during testing. This provides:
- Full isolation from real API
- Consistent test results
- Ability to test error scenarios (500, 404, etc.)
- Control over response timing (for loading state tests)

### Mock Handlers

Mock handlers are defined in `src/__tests__/mocks/handlers.js`:
- Success responses
- Error responses (500, 404)
- Slow responses (for loading state testing)
- Network errors

## Test Scenarios Covered

### 1. Success Cases
- ✅ Fetching jobs successfully
- ✅ Creating jobs successfully
- ✅ Cancelling jobs successfully
- ✅ Deleting jobs successfully
- ✅ Getting job results successfully

### 2. Error Cases
- ✅ 500 Internal Server Error
- ✅ 404 Not Found
- ✅ Network timeouts
- ✅ Invalid requests

### 3. Race Conditions
- ✅ Concurrent job fetches
- ✅ Rapid form submissions
- ✅ Multiple delete/cancel requests
- ✅ Race between fetch and create

### 4. Loading States
- ✅ Loading state during API calls
- ✅ Slow API response handling
- ✅ Skeleton screens (if implemented)
- ✅ Button disabled states during submission

### 5. Edge Cases
- ✅ Empty job lists
- ✅ Large file uploads
- ✅ Special characters in file names
- ✅ Complex option objects

## E2E Test Scenarios

### Job Management
- Dashboard displays correctly
- Creating a new job
- Form validation
- Job list display
- Loading states
- Error handling (500, 404)
- Slow API responses

### Race Conditions
- Rapid form submissions
- Concurrent requests
- Duplicate prevention

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock Data**: Use MSW handlers to provide consistent mock data
3. **Cleanup**: Reset handlers after each test
4. **Async Handling**: Always await async operations in tests
5. **Error Scenarios**: Test both success and error paths
6. **Race Conditions**: Test concurrent operations
7. **Loading States**: Verify UI shows appropriate loading indicators

## Coverage Reports

After running `npm run test:coverage`, view the HTML report:
- Open `coverage/index.html` in your browser
- Review coverage by file and function
- Identify areas needing more tests

## Continuous Integration

Tests should pass consistently in CI environments:
- No flaky tests
- Deterministic results
- Fast execution
- Proper error reporting
