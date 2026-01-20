import { io } from 'socket.io-client';

let socket = null;
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const connectWebSocket = (url = WS_URL) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToSystemMetrics = (callback) => {
  if (socket) {
    socket.on('system:metrics', callback);
  }
};

export const unsubscribeFromSystemMetrics = () => {
  if (socket) {
    socket.off('system:metrics');
  }
};

export const subscribeToJobMetrics = (jobId, callback) => {
  if (socket) {
    socket.on(`job:${jobId}:metrics`, callback);
    socket.on(`job:${jobId}:progress`, callback);
  }
};

export const unsubscribeFromJobMetrics = (jobId) => {
  if (socket) {
    socket.off(`job:${jobId}:metrics`);
    socket.off(`job:${jobId}:progress`);
  }
};

export const subscribeToDockerContainers = (callback) => {
  if (socket) {
    socket.on('docker:containers', callback);
  }
};

export const unsubscribeFromDockerContainers = () => {
  if (socket) {
    socket.off('docker:containers');
  }
};

export const getSocket = () => socket;
