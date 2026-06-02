import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailsPage from './pages/OpportunityDetailsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

/**
 * Root Application Router & Session State Orchestrator
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing / Placements Listing Pages */}
          <Route path="/" element={<OpportunitiesPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />

          {/* Dedicated Placement Details Page */}
          <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />

          {/* Register Account Page */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Login Account Page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Placements Management Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Catch-all fallback redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
