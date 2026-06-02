import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable Global Dynamic Navigation Bar Component
 */
const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mobile responsive menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  // Helper to resolve active styling rings on navigation tabs
  const isActive = (path) => location.pathname === path;
  
  const linkClasses = (path) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
    }`;

  const mobileLinkClasses = (path) =>
    `block px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-150 ${
      isActive(path)
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
    }`;

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full glass-panel shadow-sm border-b border-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo & title */}
        <Link
          to="/"
          id="nav-logo-link"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-3 select-none hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg tracking-tighter">
            A
          </div>
          <span className="font-bold text-slate-800 text-base tracking-wide uppercase">
            AIESEC <span className="text-indigo-600 font-extrabold">Amaravati</span>
          </span>
        </Link>

        {/* Desktop Link Deck */}
        <nav className="hidden md:flex items-center space-x-1.5" id="nav-desktop-deck">
          {/* GUEST LINKS */}
          {!isAuthenticated && (
            <>
              <Link to="/" id="nav-guest-home" className={linkClasses('/')}>
                Home
              </Link>
              <Link to="/login" id="nav-guest-login" className={linkClasses('/login')}>
                Login
              </Link>
              <Link to="/register" id="nav-guest-register" className={linkClasses('/register')}>
                Register
              </Link>
            </>
          )}

          {/* STANDARD USER (STUDENT) LINKS */}
          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/" id="nav-user-home" className={linkClasses('/')}>
                Home
              </Link>
              <Link to="/opportunities" id="nav-user-opps" className={linkClasses('/opportunities')}>
                Opportunities
              </Link>
              <Link to="/applications" id="nav-user-apps" className={linkClasses('/applications')}>
                My Applications
              </Link>
              <Link to="/profile" id="nav-user-profile" className={linkClasses('/profile')}>
                Profile
              </Link>
              <button
                type="button"
                id="nav-user-logout"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 outline-none active:scale-95"
              >
                Logout
              </button>
            </>
          )}

          {/* ADMINISTRATOR LINKS */}
          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin/dashboard" id="nav-admin-dashboard" className={linkClasses('/admin/dashboard')}>
                Dashboard
              </Link>
              <Link to="/opportunities" id="nav-admin-opps" className={linkClasses('/opportunities')}>
                Opportunities
              </Link>
              <Link to="/admin/applicants" id="nav-admin-applicants" className={linkClasses('/admin/applicants')}>
                Applicants
              </Link>
              <Link to="/profile" id="nav-admin-profile" className={linkClasses('/profile')}>
                Profile
              </Link>
              <button
                type="button"
                id="nav-admin-logout"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 outline-none active:scale-95"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Hamburger menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Responsive layout) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur px-4 py-3 space-y-1 animate-fade-in-up" id="nav-mobile-drawer">
          {/* GUEST LINKS */}
          {!isAuthenticated && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/')}>
                Home
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/login')}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/register')}>
                Register
              </Link>
            </>
          )}

          {/* USER LINKS */}
          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/')}>
                Home
              </Link>
              <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/opportunities')}>
                Opportunities
              </Link>
              <Link to="/applications" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/applications')}>
                My Applications
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/profile')}>
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {/* ADMIN LINKS */}
          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/admin/dashboard')}>
                Dashboard
              </Link>
              <Link to="/opportunities" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/opportunities')}>
                Opportunities
              </Link>
              <Link to="/admin/applicants" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/admin/applicants')}>
                Applicants
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClasses('/profile')}>
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
