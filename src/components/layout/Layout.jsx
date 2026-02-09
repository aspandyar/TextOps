import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Layout.css';

/**
 * Layout route: wraps all main app content with Header and renders
 * child routes via Outlet (HomePage or JobDetailPage).
 */
const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <Outlet />
    </div>
  );
};

export default Layout;
