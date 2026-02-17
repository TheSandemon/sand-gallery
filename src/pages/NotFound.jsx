import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-lg">
        {/* 404 Visual */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] leading-none font-bold text-[var(--accent-primary)] opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-[var(--accent-secondary)] opacity-30 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--text-dim)] text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-all duration-300"
          >
            <Home size={20} />
            Go Home
          </Link>
          <Link
            to="/gallery"
            className="flex items-center gap-2 px-6 py-3 border border-[var(--accent-primary)]/30 text-[var(--text-primary)] font-semibold rounded-lg hover:bg-[var(--accent-primary)]/10 transition-all duration-300"
          >
            <Search size={20} />
            Browse Gallery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
