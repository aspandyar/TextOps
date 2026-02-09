import React, { memo, useMemo } from 'react';
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
import './MetricsChart.css';

const MetricsChart = memo(({ data, metrics = ['linesProcessed', 'speed'] }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const baseTime = data[0]?.timestamp ?? 0;
    return data.map((item, index) => ({
      ...item,
      time: index,
      timestamp: item.timestamp ?? baseTime + index * 1000,
    }));
  }, [data]);

  const colors = {
    linesProcessed: '#2196F3',
    speed: '#4CAF50',
    memory: '#ff9800',
    throughput: '#f44336',
  };

  if (chartData.length === 0) {
    return (
      <div className="metrics-chart-empty">
        No data available
      </div>
    );
  }

  return (
    <div className="metrics-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'linesProcessed') return [value.toLocaleString(), 'Lines Processed'];
              if (name === 'speed') return [value.toLocaleString(), 'Speed (lines/s)'];
              if (name === 'memory') return [`${value.toFixed(2)}%`, 'Memory'];
              if (name === 'throughput') return [`${value.toFixed(2)} MB/s`, 'Throughput'];
              return [value, name];
            }}
          />
          <Legend />
          {metrics.includes('linesProcessed') && (
            <Line
              type="monotone"
              dataKey="linesProcessed"
              stroke={colors.linesProcessed}
              strokeWidth={2}
              dot={false}
              name="Lines Processed"
            />
          )}
          {metrics.includes('speed') && (
            <Line
              type="monotone"
              dataKey="speed"
              stroke={colors.speed}
              strokeWidth={2}
              dot={false}
              name="Speed (lines/s)"
            />
          )}
          {metrics.includes('memory') && (
            <Line
              type="monotone"
              dataKey="memory"
              stroke={colors.memory}
              strokeWidth={2}
              dot={false}
              name="Memory (%)"
            />
          )}
          {metrics.includes('throughput') && (
            <Line
              type="monotone"
              dataKey="throughput"
              stroke={colors.throughput}
              strokeWidth={2}
              dot={false}
              name="Throughput (MB/s)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MetricsChart.displayName = 'MetricsChart';

export default MetricsChart;
