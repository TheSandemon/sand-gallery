import React from 'react';

const PageLoader = ({ variant = 'default' }) => {
  // Skeleton variants for different page layouts
  const skeletons = {
    default: (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-dim)] text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    ),
    grid: (
      <div className="pt-[120px] px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="h-12 w-48 bg-[var(--bg-card)] rounded animate-pulse mb-8" />
        
        {/* Grid skeleton - 3 columns desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="bg-[var(--bg-card)] rounded-lg overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="aspect-video bg-[var(--bg-main)]" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-3/4 bg-[var(--bg-main)] rounded" />
                <div className="h-4 w-1/2 bg-[var(--bg-main)] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    hero: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-64 bg-[var(--bg-card)] rounded mx-auto animate-pulse" />
          <div className="h-6 w-96 bg-[var(--bg-card)] rounded mx-auto animate-pulse" />
          <div className="h-6 w-72 bg-[var(--bg-card)] rounded mx-auto animate-pulse" />
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {skelets[variant] || skeletons.default}
    </div>
  );
};

export default PageLoader;
