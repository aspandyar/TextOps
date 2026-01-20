export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  return `${hours}h ${mins}m ${secs}s`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const formatPercentage = (value) => {
  return `${Math.round(value)}%`;
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat().format(value);
};
