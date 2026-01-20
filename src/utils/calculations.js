export const calculateETA = (progress, elapsedTime) => {
  if (progress <= 0 || progress >= 100) return 0;
  const rate = progress / elapsedTime;
  const remaining = 100 - progress;
  return remaining / rate;
};

export const calculateThroughput = (linesProcessed, elapsedTime) => {
  if (elapsedTime <= 0) return 0;
  return linesProcessed / elapsedTime;
};

export const calculateAverage = (values) => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

export const calculateMax = (values) => {
  if (values.length === 0) return 0;
  return Math.max(...values);
};

export const calculateMin = (values) => {
  if (values.length === 0) return 0;
  return Math.min(...values);
};
