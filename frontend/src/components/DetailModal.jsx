import React, { useEffect } from 'react';

/**
 * High-end Glassmorphic Detail Slide-over / Modal Component
 * @param {Object} props
 * @param {Object} props.opp - Selected opportunity details
 * @param {boolean} props.isOpen - Open state status
 * @param {function} props.onClose - Close action callback
 */
const DetailModal = ({ opp, isOpen, onClose }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !opp) return null;

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
  const typeLabel = isGTa ? 'Global Talent Placement' : 'Global Volunteer Placement';
  const colorTheme = isGTa ? 'text-amber-600 bg-amber-50' : 'text-indigo-600 bg-indigo-50';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      id="detail-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal body */}
      <div
        id="detail-modal-body"
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-3xl bg-white/95 border-l sm:border border-white/20 shadow-2xl overflow-y-auto flex flex-col justify-between max-h-[100dvh] sm:max-h-[90vh] animate-fade-in-up"
      >
        {/* Header section */}
        <div className="relative p-6 sm:p-8 border-b border-slate-100">
          <div className="flex justify-between items-start pr-8">
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider mb-3 ${colorTheme}`}>
                {typeLabel}
              </span>
              <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
                {title}
              </h2>
            </div>
            {/* Close button */}
            <button
              type="button"
              id="modal-btn-close"
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200 outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Close details modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100/50">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Location</div>
              <div id="modal-meta-loc" className="text-sm font-bold text-slate-800 truncate">{city}, {country}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Duration</div>
              <div id="modal-meta-dur" className="text-sm font-bold text-slate-800">{duration} Weeks</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Stipend Details</div>
              <div id="modal-meta-stipend" className="text-sm font-bold text-emerald-600">{stipend}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2.5">Program Overview</h3>
            <p id="modal-desc" className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/40 p-4 rounded-xl border border-slate-100/50">
              {description}
            </p>
          </div>

          {/* Skills Required */}
          {skillsRequired.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2" id="modal-skills-container">
                {skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors duration-150"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Deadline & Poster Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
            {/* Deadline */}
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-50 text-orange-600">
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Application Deadline</div>
                <div id="modal-deadline" className="text-sm font-bold text-slate-800">
                  {formatDate(applicationDeadline)}
                </div>
              </div>
            </div>

            {/* Poster Author */}
            {createdBy && (
              <div className="flex items-center space-x-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Placement Manager</div>
                  <div id="modal-manager" className="text-sm font-bold text-slate-800">
                    {createdBy.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            id="modal-btn-apply"
            onClick={() => {
              alert(`Ready to apply for: ${title}! This will direct you to the opportunity portal.`);
            }}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all duration-200"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
