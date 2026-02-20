import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { fetchJobs } from './store/slices/jobsSlice';
import { fetchMe } from './store/slices/authSlice';
import { addAlert } from './store/slices/alertsSlice';
import { useWebSocket } from './hooks/useWebSocket';
import AlertContainer from './components/common/AlertContainer';
import Layout from './components/layout/Layout';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

/** Protects task routes (e.g. job detail). If not logged in, shows alert and redirects to home. */
const RequireAuthForTask = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!token && !isAuthenticated) {
      dispatch(addAlert({ type: 'error', message: 'Please log in to view this page.' }));
      navigate('/', { replace: true });
    }
  }, [token, isAuthenticated, dispatch, navigate]);
  if (!token && !isAuthenticated) return null;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  if (token || isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const AppContent = () => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  useWebSocket();

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchJobs());
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <AlertContainer />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route
              path="job/:jobId"
              element={
                <RequireAuthForTask>
                  <JobDetailPage />
                </RequireAuthForTask>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
