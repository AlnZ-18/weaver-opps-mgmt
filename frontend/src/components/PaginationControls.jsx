import React from 'react';

/**
 * Modern Premium Pagination Controls
 * @param {Object} props
 * @param {number} props.page - Current active page number
 * @param {number} props.pages - Total number of pages
 * @param {number} props.total - Total number of active records
 * @param {number} props.limit - Number of records displayed per page
 * @param {function} props.onPageChange - Click callback function
 */
const PaginationControls = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;

  // Calculate showing metrics
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate numbered list
  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav
      id="pagination-nav"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mt-8 rounded-2xl border border-slate-100 bg-white shadow-sm animate-fade-in-up"
      aria-label="Pagination Navigation"
    >
      {/* Information status */}
      <div className="text-sm text-slate-500 font-medium" id="pagination-info">
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-700">{endItem}</span> of{' '}
        <span className="font-semibold text-indigo-600">{total}</span> Opportunities
      </div>

      {/* Button deck */}
      <div className="flex items-center space-x-1.5" id="pagination-buttons">
        {/* Previous page */}
        <button
          type="button"
          id="pagination-btn-prev"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-200 outline-none ${
            page === 1
              ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 focus:ring-2 focus:ring-indigo-400'
          }`}
          aria-label="Go to Previous Page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((num) => {
          const isActive = num === page;
          return (
            <button
              key={num}
              type="button"
              id={`pagination-btn-page-${num}`}
              onClick={() => onPageChange(num)}
              className={`min-w-[40px] h-10 px-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border outline-none active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 focus:ring-2 focus:ring-indigo-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-indigo-400'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {num}
            </button>
          );
        })}

        {/* Next page */}
        <button
          type="button"
          id="pagination-btn-next"
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-200 outline-none ${
            page === pages
              ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50/50'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 focus:ring-2 focus:ring-indigo-400'
          }`}
          aria-label="Go to Next Page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default PaginationControls;
