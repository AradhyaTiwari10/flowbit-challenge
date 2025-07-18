import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import { useAuthStore } from './stores/authStore';
import { useAppStore } from './stores/appStore';
import './index.css';

const App: React.FC = () => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const { setTenant } = useAppStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?.tenantId) {
      setTenant(user.tenantId);
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoginForm />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/tickets" replace />} />
            <Route path="tickets/*" element={<div />} />
            <Route path="admin/*" element={<div />} />
            <Route path="*" element={<Navigate to="/tickets" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App; 