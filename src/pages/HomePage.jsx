import React, { lazy, Suspense } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/layout/Dashboard';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
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
