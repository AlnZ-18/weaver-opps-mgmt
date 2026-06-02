import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard restricting access to administrator sessions only
 * @param {Object} props
 * @param {React.ReactNode} props.children - Admin-only child elements
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show a clean loader while AuthProvider boots and checks localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 select-none">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Authorizing Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated guests to login page
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect authenticated standard users to the main public opportunities list
    return <Navigate to="/opportunities" replace />;
  }

  return children;
};

export default AdminRoute;
