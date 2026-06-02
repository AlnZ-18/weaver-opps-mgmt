import React, { useState, useEffect } from 'react';
import { fetchOpportunities } from '../utils/api';
import OpportunityCard from '../components/OpportunityCard';
import OpportunitySkeleton from '../components/OpportunitySkeleton';
import PaginationControls from '../components/PaginationControls';
import Navbar from '../components/Navbar';

function OpportunitiesPage() {
  // --- States ---
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pagination & Filter States ---
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // Default 6 opportunities per page for grid elegance
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [programType, setProgramType] = useState(''); // '' (All), 'GTa', 'GV'

  // --- Fetch Opportunities List ---
  useEffect(() => {
    const loadOpportunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOpportunities({ page, limit, programType });
        if (data.success) {
          setOpportunities(data.opportunities || []);
          setTotal(data.pagination.total || 0);
          setPages(data.pagination.pages || 1);
        } else {
          setError('Failed to fetch placements from database.');
        }
      } catch (err) {
        setError('Connection failure: Unable to communicate with the opportunity API service.');
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, [page, programType, limit]);

  // --- Filter Selector Click Handler ---
  const handleFilterChange = (type) => {
    setProgramType(type);
    setPage(1); // Reset back to first page on category change
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Dynamic Global Navigation Header */}
      <Navbar />


      {/* Main Section */}
      <main id="app-main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* SEO Header hierarchy & Hero section */}
        <section id="hero-section" className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-fade-in-up">
          <h1 id="main-seo-title" className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4 sm:mb-6">
            Discover Transformative <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
              Global Placements
            </span>
          </h1>
          <p id="hero-description" className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Embark on prestigious cross-cultural exchange programs designed to develop leadership, international competencies, and practical professional experience with AIESEC Amaravati.
          </p>
        </section>

        {/* Category Pill Filters (Responsive design with hover enhancements) */}
        <div id="filter-deck" className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-in-up">
          <button
            type="button"
            id="filter-btn-all"
            onClick={() => handleFilterChange('')}
            className={`px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 outline-none active:scale-95 ${
              programType === ''
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            All Programs
          </button>
          
          <button
            type="button"
            id="filter-btn-gta"
            onClick={() => handleFilterChange('GTa')}
            className={`px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 outline-none active:scale-95 flex items-center space-x-2 ${
              programType === 'GTa'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-50'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${programType === 'GTa' ? 'bg-white' : 'bg-amber-400'}`} />
            <span>Global Talent (GTa)</span>
          </button>
          
          <button
            type="button"
            id="filter-btn-gv"
            onClick={() => handleFilterChange('GV')}
            className={`px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 outline-none active:scale-95 flex items-center space-x-2 ${
              programType === 'GV'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-50'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${programType === 'GV' ? 'bg-white' : 'bg-indigo-500'}`} />
            <span>Global Volunteer (GV)</span>
          </button>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div id="error-banner" className="p-5 rounded-2xl border border-red-100 bg-red-50 text-red-700 text-center max-w-md mx-auto mb-10 shadow-sm animate-fade-in-up" role="alert">
            <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold text-sm leading-snug">{error}</p>
          </div>
        )}

        {/* Placements Grid Block */}
        {!error && (
          <div id="opportunities-grid-block">
            {loading ? (
              // Loading State Shimmers Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
                <OpportunitySkeleton />
              </div>
            ) : opportunities.length === 0 ? (
              // Empty Placements Card
              <div id="empty-opportunities-card" className="p-10 rounded-3xl border border-slate-100 bg-white text-center max-w-md mx-auto shadow-sm animate-fade-in-up">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2m0 0V5a2 2 0 012-2h10a2 2 0 012 2v12M9 11h6" />
                </svg>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Placements Found</h3>
                <p className="text-sm text-slate-500 leading-normal">
                  There are currently no open opportunities matching this category. Please check back later or browse other exchange options.
                </p>
              </div>
            ) : (
              // Actual Opportunity Grid Display
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {opportunities.map((opp) => (
                    <OpportunityCard
                      key={opp._id}
                      opp={opp}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <PaginationControls
                  page={page}
                  pages={pages}
                  total={total}
                  limit={limit}
                  onPageChange={(num) => setPage(num)}
                />
              </>
            )}
          </div>
        )}
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

export default OpportunitiesPage;
