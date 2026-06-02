import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Modern premium Opportunity Card display
 * @param {Object} props
 * @param {Object} props.opp - Opportunity model details
 */
const OpportunityCard = ({ opp }) => {
  const { _id, title, programType, country, city, duration, stipend } = opp;

  // Program specific themes: GTa (Professional Amber/Gold), GV (Volunteer Violet/Indigo)
  const isGTa = programType === 'GTa';
  const badgeClasses = isGTa
    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
    : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm';

  const typeLabel = isGTa ? 'Global Talent' : 'Global Volunteer';

  return (
    <article
      id={`opp-card-${_id}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl glass-card transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
    >
      {/* Upper Section */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <span
            id={`opp-badge-${_id}`}
            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${badgeClasses}`}
          >
            {typeLabel}
          </span>
          <span className="text-xs font-medium text-slate-400 select-none">
            {programType}
          </span>
        </div>

        {/* Title */}
        <h3
          id={`opp-title-${_id}`}
          className="text-lg font-bold text-slate-800 leading-snug mb-4 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2"
          title={title}
        >
          {title}
        </h3>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm text-slate-600">
          {/* Location */}
          <div className="flex items-center space-x-2" id={`opp-loc-${_id}`}>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate font-medium">{city}, {country}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2" id={`opp-dur-${_id}`}>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-slate-700">{duration} Weeks</span>
          </div>

          {/* Stipend details */}
          <div className="flex items-center space-x-2 col-span-2" id={`opp-stipend-${_id}`}>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-emerald-600 truncate bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded-lg text-xs">
              {stipend}
            </span>
          </div>
        </div>
      </div>

      {/* View Details Action Link */}
      <Link
        id={`opp-btn-view-${_id}`}
        to={`/opportunities/${_id}`}
        className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 transform bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0 outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center justify-center"
      >
        View Details
      </Link>
    </article>
  );
};

export default OpportunityCard;

