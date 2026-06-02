import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard restricting access to authenticated users only
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected child elements
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show a clean loader while AuthProvider boots and checks localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 select-none">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Gracefully redirect unauthenticated guests to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
