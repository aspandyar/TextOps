import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { selectSystemMetricsByType } from '../../store/selectors/metricsSelectors';
import './SystemMetricsChart.css';

const SystemMetricsChart = memo(({ metricType = 'cpu' }) => {
  const metrics = useSelector((state) => selectSystemMetricsByType(state, metricType));

  const chartData = useMemo(() => {
    if (metrics.length === 0) return [];
    
    return metrics.map((item, index) => ({
      value: item.value,
      time: index,
      timestamp: item.timestamp,
    }));
  }, [metrics]);

  const colors = {
    cpu: '#2196F3',
    memory: '#4CAF50',
    gpu: '#ff9800',
    network: '#f44336',
    disk: '#9c27b0',
  };

  const labels = {
    cpu: 'CPU Usage (%)',
    memory: 'Memory Usage (%)',
    gpu: 'GPU Usage (%)',
    network: 'Network (MB/s)',
    disk: 'Disk I/O (MB/s)',
  };

  if (chartData.length === 0) {
    return (
      <div className="system-metrics-chart-empty">
        No {metricType} metrics available
      </div>
    );
  }

  return (
    <div className="system-metrics-chart">
      <h4 className="system-metrics-chart-title">{labels[metricType]}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}${metricType === 'cpu' || metricType === 'memory' || metricType === 'gpu' ? '%' : ''}`, labels[metricType]]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors[metricType]}
            strokeWidth={2}
            dot={false}
            name={labels[metricType]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

SystemMetricsChart.displayName = 'SystemMetricsChart';

export default SystemMetricsChart;
