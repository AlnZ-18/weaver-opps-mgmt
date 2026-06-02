import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Dynamic Global Navigation Header */}
      <Navbar />


      {/* Main Section */}
      <main id="app-main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Welcome Section */}
        <section className="mb-12 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8 rounded-3xl glass-card border border-slate-100">
            <div>
              <h1 id="admin-welcome-header" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Hello, {user?.name || 'Administrator'}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Manage exchange opportunities, track applicant submissions, and check program lifecycles.
              </p>
            </div>
            <div>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-indigo-600 transition-all duration-200 active:scale-95"
              >
                Browse Public Grid
              </Link>
            </div>
          </div>
        </section>

        {/* Analytics Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Widget 1: Total Opportunities */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Placements</div>
              <div className="text-2xl font-black text-slate-800">12</div>
            </div>
          </div>

          {/* Widget 2: GTa Placements */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Global Talent (GTa)</div>
              <div className="text-2xl font-black text-slate-800">7</div>
            </div>
          </div>

          {/* Widget 3: GV Placements */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V10a2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Global Volunteer (GV)</div>
              <div className="text-2xl font-black text-slate-800">5</div>
            </div>
          </div>
        </section>

        {/* Informative placeholder cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          {/* Quick Placements Manager */}
          <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Create Opportunity</h3>
              <p className="text-sm text-slate-500 leading-normal mb-6">
                Publish a new Global Volunteer (GV) or Global Talent (GTa) exchange program with required skills, stipend figures, and deadlines.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="py-3 px-5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed outline-none select-none w-fit"
            >
              + Create Form (Phase 6)
            </button>
          </div>

          {/* Applicant Queue */}
          <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Application Submissions</h3>
              <p className="text-sm text-slate-500 leading-normal mb-6">
                Review incoming student resumes, contact parameters, and change workflow review states.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="py-3 px-5 rounded-xl font-bold text-xs bg-slate-100 text-slate-400 cursor-not-allowed outline-none select-none w-fit"
            >
              Review Queue (Phase 6)
            </button>
          </div>
        </section>
      </main>

      {/* Semantic footer */}
      <footer id="app-footer" className="w-full bg-white border-t border-slate-100 py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            © {new Date().getFullYear()} AIESEC in Amaravati. Administrative Portal Session.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default AdminDashboardPage;
