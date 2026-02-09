import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWebSocket, disconnectWebSocket, subscribeToSystemMetrics, unsubscribeFromSystemMetrics, subscribeToDockerContainers, unsubscribeFromDockerContainers } from '../services/websocket';
import { updateSystemMetrics } from '../store/slices/metricsSlice';
import { setConnectionStatus, updateDockerContainers } from '../store/slices/systemSlice';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const isConnected = useSelector(state => state.system.isConnected);
  const socketRef = useRef(null);

  useEffect(() => {
    // Defer initial connection to avoid "connection refused" on first load when backend is still starting
    const timeoutId = setTimeout(() => {
      const socket = connectWebSocket();
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected');
        dispatch(setConnectionStatus(true));
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        dispatch(setConnectionStatus(false));
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        dispatch(setConnectionStatus(false));
      });

      // Subscribe to system metrics
      subscribeToSystemMetrics((data) => {
        if (data.cpu !== undefined) {
          dispatch(updateSystemMetrics({
            type: 'cpu',
            value: data.cpu,
            timestamp: Date.now(),
          }));
        }
        if (data.memory !== undefined) {
          dispatch(updateSystemMetrics({
            type: 'memory',
            value: data.memory,
            timestamp: Date.now(),
          }));
        }
        if (data.gpu !== undefined) {
          dispatch(updateSystemMetrics({
            type: 'gpu',
            value: data.gpu,
            timestamp: Date.now(),
          }));
        }
        if (data.network !== undefined) {
          dispatch(updateSystemMetrics({
            type: 'network',
            value: data.network,
            timestamp: Date.now(),
          }));
        }
        if (data.disk !== undefined) {
          dispatch(updateSystemMetrics({
            type: 'disk',
            value: data.disk,
            timestamp: Date.now(),
          }));
        }
      });

      // Subscribe to Docker containers
      subscribeToDockerContainers((containers) => {
        dispatch(updateDockerContainers(containers));
      });
    }, 800);

    return () => {
      clearTimeout(timeoutId);
      unsubscribeFromSystemMetrics();
      unsubscribeFromDockerContainers();
      disconnectWebSocket();
    };
  }, [dispatch]);

  return { isConnected };
};
