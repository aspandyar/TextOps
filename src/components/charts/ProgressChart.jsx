import React, { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './ProgressChart.css';

const ProgressChart = memo(({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => ({
      progress: item.progress || 0,
      time: index,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="progress-chart-empty">
        No progress data available
      </div>
    );
  }

  return (
    <div className="progress-chart">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value) => [`${value.toFixed(1)}%`, 'Progress']}
          />
          <Area
            type="monotone"
            dataKey="progress"
            stroke="#2196F3"
            fill="#2196F3"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

ProgressChart.displayName = 'ProgressChart';

export default ProgressChart;
