# TextOps Dashboard

A Linux text-processing dashboard with real-time streaming metrics. Process large text files with multiple job types (word count, dedup, cleaning, sorting) and monitor progress, memory, and CPU usage in real-time.

## Features

- 🚀 **Real-time Monitoring**: Live updates via WebSocket for job progress and system metrics
- 📊 **Interactive Charts**: Visualize metrics with Recharts
- 📁 **File Processing**: Support for multiple job types (word count, deduplication, cleaning, sorting)
- 🎯 **Job Management**: Create, monitor, and manage text processing jobs
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Performance Optimized**: Memoization, lazy loading, and virtual scrolling

## Tech Stack

- **React 19** - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing with lazy loading
- **React Hook Form** - Form management with async validation
- **Recharts** - Data visualization
- **Socket.io Client** - Real-time WebSocket communication
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

**Note**: If you encounter issues, you may need to install `react-router-dom` separately:
```bash
npm install react-router-dom
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint

## Project Structure

```
TextOps/
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Reusable components
│   │   ├── forms/         # Form components
│   │   ├── jobs/          # Job-related components
│   │   ├── charts/        # Chart components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── selectors/     # Redux selectors
│   ├── services/          # API and WebSocket services
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── __tests__/         # Test files
├── public/                # Static assets
├── REPORT.md              # Technical documentation
└── package.json
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

## Usage

### Creating a Job

1. Select a job type (Word Count, Remove Duplicates, Clean Trash, or Sort Numbers)
2. Upload a text file (.txt, .csv, .tsv, .json)
3. Configure job-specific options if needed
4. Click "Create Job"

### Monitoring Jobs

- View all jobs in the dashboard
- Click on a job card to see detailed metrics
- Monitor real-time progress and system metrics
- Cancel or delete jobs as needed

### System Metrics

The dashboard displays real-time system metrics:
- CPU Usage
- Memory Usage
- GPU Usage (if available)
- Network I/O
- Disk I/O

## Testing

Run the test suite:
```bash
npm test
```

View test coverage:
```bash
npm run test:coverage
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Performance Optimizations

- **React.memo()** - Prevents unnecessary re-renders
- **useMemo** - Memoizes expensive calculations
- **useCallback** - Memoizes event handlers
- **Lazy Loading** - Code splitting for routes
- **Virtual Scrolling** - Efficient rendering of large lists
- **Redux Selectors** - Memoized state selections

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT

## Documentation

For detailed technical documentation, see [REPORT.md](./REPORT.md).
