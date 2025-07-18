import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LazyMicroFrontend from '../MicroFrontend/LazyMicroFrontend';

export const Layout: React.FC = () => {
  const location = useLocation();
  const [currentApp, setCurrentApp] = useState<string>('');

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/tickets')) {
      setCurrentApp('supportTicketsApp');
    } else if (path.startsWith('/admin')) {
      setCurrentApp('adminDashboard');
    } else {
      setCurrentApp('');
    }
  }, [location.pathname]);

  const renderMicroFrontend = () => {
    if (currentApp === 'supportTicketsApp') {
      return (
        <LazyMicroFrontend
          remote="supportTicketsApp"
          module="SupportTicketsApp"
          fallback={<div>Loading Support Tickets App...</div>}
        />
      );
    } else if (currentApp === 'adminDashboard') {
      return (
        <LazyMicroFrontend
          remote="adminDashboard"
          module="AdminDashboard"
          fallback={<div>Loading Admin Dashboard...</div>}
        />
      );
    }
    return <Outlet />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderMicroFrontend()}
        </main>
      </div>
    </div>
  );
};

export default Layout; 