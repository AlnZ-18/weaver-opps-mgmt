import React from 'react';

/**
 * Premium Loading Skeleton Card Component with a pulse animation sweep
 */
const OpportunitySkeleton = () => {
  return (
    <div className="relative flex flex-col justify-between p-6 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden animate-pulse select-none shimmer-sweep">
      <div>
        {/* Badge & Date */}
        <div className="flex justify-between items-center mb-5">
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
        </div>

        {/* Title Lines */}
        <div className="space-y-2.5 mb-6">
          <div className="h-5 w-5/6 bg-slate-200 rounded" />
          <div className="h-5 w-2/3 bg-slate-200 rounded" />
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 mb-6">
          {/* Location */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full" />
            <div className="h-4 w-20 bg-slate-100 rounded" />
          </div>

          {/* Duration */}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full" />
            <div className="h-4 w-12 bg-slate-100 rounded" />
          </div>

          {/* Stipend */}
          <div className="flex items-center space-x-2 col-span-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full" />
            <div className="h-5 w-28 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="h-10 w-full bg-slate-200 rounded-xl" />
    </div>
  );
};

export default OpportunitySkeleton;
