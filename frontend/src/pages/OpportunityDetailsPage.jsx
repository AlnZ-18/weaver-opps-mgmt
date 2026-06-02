import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOpportunityById } from '../utils/api';
import Navbar from '../components/Navbar';

function OpportunityDetailsPage() {
  const { id } = useParams();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Opportunity Details by ID ---
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOpportunityById(id);
        if (data) {
          setOpp(data);
        } else {
          setError('This exchange opportunity was not found or has been deleted.');
        }
      } catch (err) {
        setError('Connection failure: Unable to retrieve placement details from API service.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  // --- Date formatter helper ---
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <header className="w-full glass-panel h-16 border-b border-slate-100 flex items-center px-8 justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </header>
        <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-16 flex flex-col justify-center items-center">
          {/* Detailed Loading Spinner */}
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
            Fetching Placement Details...
          </p>
        </main>
      </div>
    );
  }

  if (error || !opp) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <header className="w-full glass-panel h-16 border-b border-slate-100 flex items-center px-8 select-none">
          <span className="font-bold text-slate-800 text-sm tracking-wide uppercase">AIESEC AMARAVATI</span>
        </header>
        <main className="flex-grow max-w-md w-full mx-auto px-4 py-16 flex flex-col justify-center">
          <div className="p-8 rounded-3xl border border-red-100 bg-red-50 text-center shadow-sm">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Error loading details</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{error || 'An unexpected problem occurred.'}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-indigo-600 transition-all duration-200"
            >
              Back to Opportunities
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const {
    title,
    programType,
    country,
    city,
    description,
    stipend,
    duration,
    skillsRequired = [],
    applicationDeadline,
    createdBy,
  } = opp;

  const isGTa = programType === 'GTa';
  const typeLabel = isGTa ? 'Global Talent Internship' : 'Global Volunteer Program';
  const themeClasses = isGTa ? 'text-amber-600 bg-amber-50' : 'text-indigo-600 bg-indigo-50';

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Dynamic Global Navigation Header */}
      <Navbar />


      {/* Main Section */}
      <main id="app-main-content" className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Back Link */}
        <div className="mb-6 animate-fade-in-up">
          <Link
            to="/"
            id="back-btn-details"
            className="inline-flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors duration-150 outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Opportunities</span>
          </Link>
        </div>

        {/* Hero Card Overview */}
        <section id="details-hero-section" className="p-6 sm:p-10 rounded-3xl glass-card mb-8 sm:mb-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className={`inline-block px-3.5 py-1.5 text-xs font-extrabold rounded-full uppercase tracking-wider mb-4 ${themeClasses}`}>
                {typeLabel}
              </span>
              <h1 id="details-title" className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
            </div>
            
            {/* Quick Metrics display */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 select-none">
              {/* Location Badge */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 border border-slate-100 rounded-2xl shadow-sm">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span id="details-hero-loc" className="text-xs sm:text-sm font-bold text-slate-700">{city}, {country}</span>
              </div>

              {/* Program label */}
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest">{programType}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Page Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          
          {/* Left Details Section (Overview & Skills) */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Program Description */}
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white shadow-sm">
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight mb-4 border-b border-slate-50 pb-2 flex items-center space-x-2">
                <svg className="w-5.5 h-5.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Program Description</span>
              </h2>
              <p id="details-description" className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Skills Required */}
            {skillsRequired.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white shadow-sm">
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight mb-4 border-b border-slate-50 pb-2 flex items-center space-x-2">
                  <svg className="w-5.5 h-5.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span>Required Competencies</span>
                </h2>
                <div className="flex flex-wrap gap-2.5" id="details-skills-box">
                  {skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors duration-150"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Logistical Sidebar */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {/* Logistical Metrics Card */}
            <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-6">
              
              {/* Duration display */}
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Exchange Duration</div>
                  <div id="details-duration" className="text-base font-black text-slate-800">{duration} Weeks</div>
                </div>
              </div>

              {/* Stipend display */}
              <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Stipend</div>
                  <div id="details-stipend" className="text-base font-black text-emerald-600">{stipend}</div>
                </div>
              </div>

              {/* Application Deadline */}
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Application Deadline</div>
                  <div id="details-deadline" className="text-base font-black text-slate-800">
                    {formatDate(applicationDeadline)}
                  </div>
                </div>
              </div>
            </div>

            {/* Placement Manager Details (CreatedBy) */}
            {createdBy && (
              <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Placement Manager</div>
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/60 text-indigo-600 flex items-center justify-center font-bold text-sm select-none uppercase">
                    {createdBy.name.charAt(0)}
                  </div>
                  <div>
                    <div id="details-manager-name" className="text-sm font-black text-slate-800">{createdBy.name}</div>
                    <div id="details-manager-email" className="text-xs text-slate-400 font-semibold truncate max-w-[170px]">{createdBy.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Disabled Phase 5 Apply placeholder */}
            <div className="p-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
              <div className="text-center">
                <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] uppercase tracking-wider mb-2 select-none">
                  Phase 5 Release
                </span>
                <p className="text-xs text-slate-400 font-semibold leading-normal">
                  Placement application routing and resume submissions will launch in the upcoming Phase 5.
                </p>
              </div>
              <button
                type="button"
                id="details-apply-btn-disabled"
                disabled
                className="w-full py-3 rounded-xl font-bold text-sm bg-slate-200 text-slate-400 cursor-not-allowed select-none transition-all duration-200 outline-none flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Applications Pending</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Semantic footer */}
      <footer id="app-footer" className="w-full bg-white border-t border-slate-100 py-8 select-none">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
            © {new Date().getFullYear()} AIESEC in Amaravati. All exchange programs strictly align to internal standards.
          </p>
          <div className="flex justify-center space-x-4 text-xs font-bold text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors duration-150">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors duration-150">Terms & Conditions</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default OpportunityDetailsPage;
