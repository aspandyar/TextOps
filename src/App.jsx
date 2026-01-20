import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useWebSocket } from './hooks/useWebSocket';
import AlertContainer from './components/common/AlertContainer';
import './App.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // For now, all routes are accessible
  // In production, add authentication check here
  return children;
};

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// App wrapper to initialize WebSocket
const AppContent = () => {
  useWebSocket();

  return (
    <>
      <AlertContainer />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job/:jobId"
            element={
              <ProtectedRoute>
                <JobDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
