import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './ThroughputChart.css';

const ThroughputChart = memo(({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Aggregate data by time windows for better visualization
    const windowSize = Math.max(1, Math.floor(data.length / 20));
    const aggregated = [];
    
    for (let i = 0; i < data.length; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      const avgThroughput = window.reduce((sum, item) => sum + (item.throughput || 0), 0) / window.length;
      aggregated.push({
        time: i,
        throughput: avgThroughput,
      });
    }
    
    return aggregated;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="throughput-chart-empty">
        No throughput data available
      </div>
    );
  }

  return (
    <div className="throughput-chart">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(2)} MB/s`, 'Throughput']}
          />
          <Bar dataKey="throughput" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

ThroughputChart.displayName = 'ThroughputChart';

export default ThroughputChart;
