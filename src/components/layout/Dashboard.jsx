import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectJobsStats } from '../../store/selectors/jobSelectors';
import JobList from '../jobs/JobList';
import StatCard from '../common/StatCard';
import SystemMetricsChart from '../charts/SystemMetricsChart';
import './Dashboard.css';

const Dashboard = memo(() => {
  const stats = useSelector(selectJobsStats);
  const systemMetrics = useSelector(state => state.metrics.systemMetrics);

  const hasMetrics = useMemo(() => {
    return Object.values(systemMetrics).some(metric => metric.length > 0);
  }, [systemMetrics]);

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatCard
          title="Total Jobs"
          value={stats.total}
          subtitle={`${stats.running} running, ${stats.completed} completed`}
          color="primary"
        />
        <StatCard
          title="Active Jobs"
          value={stats.running}
          subtitle="Currently processing"
          color="success"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate`}
          color="success"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          subtitle="Jobs with errors"
          color="danger"
        />
      </div>

      {hasMetrics && (
        <div className="dashboard-system-metrics">
          <h2 className="dashboard-section-title">System Metrics</h2>
          <div className="system-metrics-grid">
            <SystemMetricsChart metricType="cpu" />
            <SystemMetricsChart metricType="memory" />
            <SystemMetricsChart metricType="gpu" />
            <SystemMetricsChart metricType="network" />
          </div>
        </div>
      )}

      <div className="dashboard-jobs">
        <h2 className="dashboard-section-title">Jobs</h2>
        <JobList filter="all" />
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
