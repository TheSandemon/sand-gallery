import React from 'react';

const PageLoader = ({ variant = 'default' }) => {
  // Shimmer keyframes
  const shimmerStyle = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .shimmer {
      background: linear-gradient(
        90deg,
        var(--bg-card) 25%,
        rgba(255, 255, 255, 0.1) 50%,
        var(--bg-card) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
    }
  `;

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
        <div className="h-12 w-48 bg-[var(--bg-card)] rounded shimmer mb-8" />
        
        {/* Grid skeleton - 2 columns (matches GalleryGrid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-white/10"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Icon placeholder */}
              <div className="aspect-square p-8 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                <div className="w-20 h-20 rounded-xl shimmer" />
              </div>
              {/* Content */}
              <div className="p-6 space-y-3">
                <div className="h-8 w-3/4 bg-[var(--bg-main)] rounded shimmer" />
                <div className="h-4 w-1/2 bg-[var(--bg-main)] rounded shimmer" />
                <div className="flex justify-end mt-4">
                  <div className="h-6 w-16 bg-[var(--bg-main)] rounded-full shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <style>{shimmerStyle}</style>
      </div>
    ),
    hero: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-64 bg-[var(--bg-card)] rounded mx-auto shimmer" />
          <div className="h-6 w-96 bg-[var(--bg-card)] rounded mx-auto shimmer" />
          <div className="h-6 w-72 bg-[var(--bg-card)] rounded mx-auto shimmer" />
        </div>
        <style>{shimmerStyle}</style>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {skeletons[variant] || skeletons.default}
    </div>
  );
};

export default PageLoader;
