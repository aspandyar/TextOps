import React, { memo } from 'react';
import JobForm from '../forms/JobForm';
import './Sidebar.css';

const Sidebar = memo(() => {
  return (
    <aside className="app-sidebar">
      <JobForm />
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
