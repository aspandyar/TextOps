# Setup Instructions

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

**Important**: If you encounter errors about missing `react-router-dom`, install it separately:

```bash
npm install react-router-dom
```

### 2. Install Testing Dependencies (if not already installed)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your API endpoints:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Mock Backend Setup (For Development)

Since this is a frontend-first approach, the application includes mock data generation. To connect to a real backend:

1. Ensure your backend is running on the ports specified in `.env`
2. The WebSocket connection will automatically attempt to connect
3. If the backend is unavailable, the app will continue to work with simulated data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## Troubleshooting

### Issue: Module not found errors

**Solution**: Run `npm install` again to ensure all dependencies are installed.

### Issue: WebSocket connection fails

**Solution**: 
- Check that your backend is running
- Verify `VITE_WS_URL` in `.env` is correct
- The app will work with mock data if backend is unavailable

### Issue: Tests fail

**Solution**: 
- Ensure all test dependencies are installed: `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- Run `npm test` to see specific error messages

### Issue: Build fails

**Solution**:
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for syntax errors in console output

## Next Steps

1. Review the [README.md](./README.md) for usage instructions
2. Read [REPORT.md](./REPORT.md) for technical documentation
3. Start creating jobs and monitoring metrics!
