import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/layout/Dashboard';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-page-content">
        <Sidebar />
        <main className="home-page-main">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
